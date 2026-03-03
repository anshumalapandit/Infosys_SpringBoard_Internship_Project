package com.disaster.management.services;

import com.disaster.management.entities.*;
import com.disaster.management.repositories.DisasterEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisasterApiService {

    // ── Config constants ────────────────────────────────────────────────────────

    /** Max records to import per API call. Keeps DB lean in production. */
    private static final int FETCH_LIMIT = 20;

    /** Only import USGS earthquakes at or above this magnitude (< 4.5 = minor). */
    private static final double MIN_MAG = 4.5;

    /** Look-back window in hours for every sync cycle. */
    private static final int LOOKBACK_HOURS = 24;

    /** Per-city OpenWeather debounce in ms (skip re-fetch if < 10 min ago). */
    private static final long OW_DEBOUNCE_MS = 10 * 60 * 1000L;

    // ── Dependencies ────────────────────────────────────────────────────────────

    private final DisasterEventRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Tracks last successful OpenWeather fetch time per city to debounce. */
    private final Map<String, Long> owLastFetchMs = new ConcurrentHashMap<>();

    @Value("${openweather.api.key}")
    private String openWeatherApiKey;

    // ── Scheduler ───────────────────────────────────────────────────────────────

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void autoSyncDisasterData() {
        log.info("Starting auto-sync of disaster data...");
        syncFromExternalApi();
    }

    public void syncFromExternalApi() {
        syncUSGS();
        syncNASA();
        syncOpenWeather();
    }

    // ── USGS Earthquake API ─────────────────────────────────────────────────────
    //
    // URL: https://earthquake.usgs.gov/fdsnws/event/1/query
    // Params used:
    // format=geojson – JSON response
    // orderby=time – newest first
    // limit=20 – at most 20 records per call ← LIMIT
    // minmagnitude=4.5 – skip micro-quakes ← FILTER
    // starttime=<ISO> – last 24 h only ← TIME WINDOW
    //
    private void syncUSGS() {
        try {
            String startTime = LocalDateTime.now()
                    .minusHours(LOOKBACK_HOURS)
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            String url = String.format(
                    "https://earthquake.usgs.gov/fdsnws/event/1/query"
                            + "?format=geojson&orderby=time&limit=%d&minmagnitude=%.1f&starttime=%s",
                    FETCH_LIMIT, MIN_MAG, startTime);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode features = root.get("features");

            int newEvents = 0;
            if (features != null && features.isArray()) {
                for (JsonNode feature : features) {
                    JsonNode props = feature.get("properties");
                    JsonNode geometry = feature.get("geometry");
                    JsonNode coords = geometry.get("coordinates");

                    String title = props.get("title").asText();
                    long timeMs = props.get("time").asLong();
                    LocalDateTime eventTime = LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(timeMs), ZoneId.systemDefault());

                    if (repository.findByTitleAndEventTime(title, eventTime).isPresent())
                        continue;

                    double mag = props.get("mag").asDouble();
                    SeverityLevel severity = mag < 5.0 ? SeverityLevel.LOW
                            : mag < 6.0 ? SeverityLevel.MEDIUM
                                    : mag < 7.0 ? SeverityLevel.HIGH
                                            : SeverityLevel.CRITICAL;

                    DisasterEvent event = DisasterEvent.builder()
                            .title(title)
                            .description(props.get("place").asText())
                            .disasterType(DisasterType.EARTHQUAKE)
                            .severity(severity)
                            .latitude(coords.get(1).asDouble())
                            .longitude(coords.get(0).asDouble())
                            .locationName(props.get("place").asText())
                            .source("USGS Earthquake API")
                            .eventTime(eventTime)
                            .status(DisasterStatus.PENDING)
                            .createdAt(LocalDateTime.now())
                            .build();

                    repository.save(event);
                    newEvents++;
                }
            }
            log.info("USGS sync complete. Added {} new event(s) [limit={}, minMag={}].",
                    newEvents, FETCH_LIMIT, MIN_MAG);
        } catch (Exception e) {
            log.error("Error syncing USGS data: {}", e.getMessage());
        }
    }

    // ── NASA EONET API ──────────────────────────────────────────────────────────
    //
    // URL: https://eonet.gsfc.nasa.gov/api/v3/events
    // Params used:
    // category=floods
    // limit=20 ← LIMIT
    // days=1 ← TIME WINDOW (last 24 h)
    //
    private void syncNASA() {
        try {
            int days = Math.max(1, LOOKBACK_HOURS / 24);
            String url = String.format(
                    "https://eonet.gsfc.nasa.gov/api/v3/events?category=floods&limit=%d&days=%d",
                    FETCH_LIMIT, days);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode events = root.get("events");

            int newEvents = 0;
            if (events != null && events.isArray()) {
                for (JsonNode eventNode : events) {
                    String title = eventNode.get("title").asText();
                    JsonNode geometries = eventNode.get("geometries");
                    if (geometries == null || !geometries.isArray() || geometries.isEmpty())
                        continue;

                    JsonNode firstGeo = geometries.get(0);
                    String timeStr = firstGeo.get("date").asText();
                    LocalDateTime eventTime = LocalDateTime.parse(timeStr.substring(0, 19));

                    if (repository.findByTitleAndEventTime(title, eventTime).isPresent())
                        continue;

                    JsonNode coords = firstGeo.get("coordinates");

                    DisasterEvent event = DisasterEvent.builder()
                            .title(title)
                            .description("Flood event reported by NASA EONET")
                            .disasterType(DisasterType.FLOOD)
                            .severity(SeverityLevel.MEDIUM)
                            .latitude(coords.get(1).asDouble())
                            .longitude(coords.get(0).asDouble())
                            .locationName("Region: " + title)
                            .source("NASA EONET API")
                            .eventTime(eventTime)
                            .status(DisasterStatus.PENDING)
                            .createdAt(LocalDateTime.now())
                            .build();

                    repository.save(event);
                    newEvents++;
                }
            }
            log.info("NASA EONET sync complete. Added {} new event(s) [limit={}, days={}].",
                    newEvents, FETCH_LIMIT, days);
        } catch (Exception e) {
            log.error("Error syncing NASA data: {}", e.getMessage());
        }
    }

    // ── OpenWeather Current-Weather API ─────────────────────────────────────────
    //
    // Hard limit: only 5 cities (already a practical cap).
    // Per-city debounce (OW_DEBOUNCE_MS = 10 min) prevents duplicate events
    // when this runs every 5 minutes – a city's `dt` timestamp only changes
    // once per hour at most, so we skip cities fetched recently.
    //
    private void syncOpenWeather() {
        String[] cities = { "London", "New York", "Tokyo", "Mumbai", "Paris" };
        long now = System.currentTimeMillis();

        for (String city : cities) {
            long lastFetch = owLastFetchMs.getOrDefault(city, 0L);
            if (now - lastFetch < OW_DEBOUNCE_MS) {
                log.debug("OpenWeather debounce active for {}; skipping.", city);
                continue;
            }

            try {
                String url = String.format(
                        "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s",
                        city, openWeatherApiKey);
                String response = restTemplate.getForObject(url, String.class);
                JsonNode root = objectMapper.readTree(response);
                JsonNode weatherArray = root.get("weather");

                if (weatherArray == null || !weatherArray.isArray() || weatherArray.isEmpty())
                    continue;

                owLastFetchMs.put(city, now); // record successful fetch time

                JsonNode weather = weatherArray.get(0);
                int weatherId = weather.get("id").asInt();

                // Filter: only import operationally significant codes
                // 2xx = Thunderstorm, 5xx = Heavy Rain, 781 = Tornado
                if (weatherId < 200 || weatherId >= 900)
                    continue;

                DisasterType type = null;
                if (weatherId >= 200 && weatherId < 300)
                    type = DisasterType.STORM;
                else if (weatherId >= 500 && weatherId < 600)
                    type = DisasterType.STORM;
                else if (weatherId == 781)
                    type = DisasterType.STORM;

                if (type == null)
                    continue;

                String title = "Weather Alert: " + weather.get("main").asText() + " in " + city;
                long timeMs = root.get("dt").asLong() * 1000;
                LocalDateTime eventTime = LocalDateTime.ofInstant(
                        Instant.ofEpochMilli(timeMs), ZoneId.systemDefault());

                if (repository.findByTitleAndEventTime(title, eventTime).isPresent())
                    continue;

                SeverityLevel severity = (weatherId == 781 || weatherId % 10 == 0)
                        ? SeverityLevel.HIGH
                        : SeverityLevel.MEDIUM;

                JsonNode coord = root.get("coord");
                DisasterEvent event = DisasterEvent.builder()
                        .title(title)
                        .description(weather.get("description").asText())
                        .disasterType(type)
                        .severity(severity)
                        .latitude(coord.get("lat").asDouble())
                        .longitude(coord.get("lon").asDouble())
                        .locationName(city)
                        .source("OpenWeather API")
                        .eventTime(eventTime)
                        .status(DisasterStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build();

                repository.save(event);
                log.info("Weather alert saved for {}: {}", city, title);

            } catch (Exception e) {
                log.error("Error syncing OpenWeather data for {}: {}", city, e.getMessage());
            }
        }
    }
}
