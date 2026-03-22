package com.disaster.management.services;

import com.disaster.management.dto.*;
import com.disaster.management.entities.*;
import com.disaster.management.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final DisasterEventRepository disasterRepository;
    private final RescueTaskRepository rescueTaskRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AlertAcknowledgmentRepository acknowledgmentRepository;

    public List<DisasterMonthlyStatsDTO> getDisasterMonthlyStats(LocalDateTime start, LocalDateTime end, String region, String type) {
        log.info("Fetching Disaster Monthly Stats. Filters: start={}, end={}, region={}, type={}", start, end, region, type);
        List<DisasterEvent> disasters = filterDisasters(start, end, region, type);
        log.info("Found {} disasters after filtering", disasters.size());
        
        Map<String, Long> counts = disasters.stream()
                .filter(d -> d.getCreatedAt() != null || d.getEventTime() != null)
                .collect(Collectors.groupingBy(
                        d -> {
                            LocalDateTime time = d.getCreatedAt() != null ? d.getCreatedAt() : d.getEventTime();
                            return time.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        },
                        Collectors.counting()
                ));

        return counts.entrySet().stream()
                .map(e -> new DisasterMonthlyStatsDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(DisasterMonthlyStatsDTO::getPeriod))
                .collect(Collectors.toList());
    }

    public List<RegionEfficiencyDTO> getRegionEfficiency(LocalDateTime start, LocalDateTime end, String region, String type) {
        log.info("Fetching Region Efficiency. Filters: start={}, end={}, region={}, type={}", start, end, region, type);
        List<DisasterEvent> disasters = filterDisasters(start, end, region, type);
        Map<String, List<DisasterEvent>> byRegion = disasters.stream()
                .collect(Collectors.groupingBy(d -> d.getLocationName() != null ? d.getLocationName() : "Unknown"));

        List<RescueTask> allTasks = rescueTaskRepository.findAll();

        return byRegion.entrySet().stream().map(e -> {
            String regionName = e.getKey();
            List<DisasterEvent> events = e.getValue();
            long handledCount = events.stream().filter(d -> d.getStatus() == DisasterStatus.RESOLVED).count();
            
            double avgResponseTime = events.stream()
                    .filter(d -> d.getStatus() == DisasterStatus.RESOLVED && d.getResolvedAt() != null)
                    .mapToDouble(d -> {
                        Optional<RescueTask> firstTask = allTasks.stream()
                                .filter(t -> d.getId().equals(t.getDisasterEvent() != null ? t.getDisasterEvent().getId() : null))
                                .min(Comparator.comparing(RescueTask::getAssignedAt));
                        
                        if (firstTask.isPresent()) {
                            return Math.abs(Duration.between(firstTask.get().getAssignedAt(), d.getResolvedAt()).toHours());
                        } else if (d.getEventTime() != null) {
                            return Math.abs(Duration.between(d.getEventTime(), d.getResolvedAt()).toHours());
                        } else if (d.getCreatedAt() != null) {
                            return Math.abs(Duration.between(d.getCreatedAt(), d.getResolvedAt()).toHours());
                        }
                        return 0.0;
                    })
                    .filter(val -> val > 0)
                    .average()
                    .orElse(0.0);

            return RegionEfficiencyDTO.builder()
                    .region(regionName)
                    .handledCount(handledCount)
                    .avgResponseTimeHours(avgResponseTime)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<ResponderPerformanceDTO> getResponderPerformance(LocalDateTime start, LocalDateTime end, String region, String type) {
        log.info("Fetching Responder Performance. Filters: start={}, end={}, region={}, type={}", start, end, region, type);
        List<User> responders = userRepository.findAllByRole(Role.ROLE_RESPONDER);
        List<RescueTask> allTasks = rescueTaskRepository.findAll().stream()
                .filter(t -> {
                    if (start != null && t.getAssignedAt() != null && t.getAssignedAt().isBefore(start)) return false;
                    if (end != null && t.getAssignedAt() != null && t.getAssignedAt().isAfter(end)) return false;
                    return true;
                }).collect(Collectors.toList());
        log.info("Found {} tasks for performance analysis", allTasks.size());

        return responders.stream().map(r -> {
            List<RescueTask> tasks = allTasks.stream()
                    .filter(t -> t.getResponder() != null && t.getResponder().getId().equals(r.getId()))
                    .collect(Collectors.toList());

            long assigned = tasks.size();
            long completed = tasks.stream().filter(t -> t.getStatus() == RescueTaskStatus.COMPLETED).count();
            double rate = assigned > 0 ? (double) completed / assigned * 100 : 0.0;

            return ResponderPerformanceDTO.builder()
                    .responderName(r.getFullName() != null ? r.getFullName() : r.getUsername())
                    .tasksAssigned(assigned)
                    .tasksCompleted(completed)
                    .completionRate(rate)
                    .build();
        }).collect(Collectors.toList());
    }

    public NotificationInsightDTO getNotificationInsights(LocalDateTime start, LocalDateTime end, String region, String type) {
        log.info("Fetching Notification Insights. Filters: start={}, end={}, region={}, type={}", start, end, region, type);
        List<Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> {
                    if (start != null && n.getSentAt() != null && n.getSentAt().isBefore(start)) return false;
                    if (end != null && n.getSentAt() != null && n.getSentAt().isAfter(end)) return false;
                    return true;
                }).collect(Collectors.toList());
        
        long totalBroadcasted = notifications.size();
        long totalAcknowledged = acknowledgmentRepository.count();
        
        long ignored = Math.max(0, totalBroadcasted - totalAcknowledged);
        double ackRate = totalBroadcasted > 0 ? (double) totalAcknowledged / totalBroadcasted * 100 : 0.0;
        double ignoreRate = totalBroadcasted > 0 ? (double) ignored / totalBroadcasted * 100 : 0.0;

        return NotificationInsightDTO.builder()
                .totalBroadcasted(totalBroadcasted)
                .totalAcknowledged(totalAcknowledged)
                .totalIgnored(ignored)
                .acknowledgmentRate(ackRate)
                .ignoredRate(ignoreRate)
                .engagementRate(ackRate)
                .build();
    }

    public List<HighRiskAreaDTO> getHighRiskAreas(LocalDateTime start, LocalDateTime end, String region, String type) {
        log.info("Fetching High Risk Areas. Filters: start={}, end={}, region={}, type={}", start, end, region, type);
        List<DisasterEvent> disasters = filterDisasters(start, end, region, type);
        
        Map<String, Long> byLocation = disasters.stream()
                .filter(d -> d.getLocationName() != null && !d.getLocationName().isEmpty())
                .collect(Collectors.groupingBy(DisasterEvent::getLocationName, Collectors.counting()));

        return byLocation.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(e -> {
                    String riskLevel = "LOW";
                    if (e.getValue() >= 5) riskLevel = "HIGH";
                    else if (e.getValue() >= 2) riskLevel = "MEDIUM";
                    
                    return new HighRiskAreaDTO(e.getKey(), e.getValue(), riskLevel);
                })
                .collect(Collectors.toList());
    }

    private List<DisasterEvent> filterDisasters(LocalDateTime start, LocalDateTime end, String region, String type) {
        List<DisasterEvent> all = disasterRepository.findAll();
        return all.stream()
                .filter(d -> {
                    // Date Filter
                    LocalDateTime time = d.getEventTime() != null ? d.getEventTime() : d.getCreatedAt();
                    if (start != null && time != null && time.isBefore(start)) return false;
                    if (end != null && time != null && time.isAfter(end)) return false;
                    
                    // Region Filter - handle empty string or "ALL"
                    if (region != null && !region.isEmpty() && !region.equalsIgnoreCase("ALL")) {
                        if (d.getLocationName() == null || !d.getLocationName().equalsIgnoreCase(region)) {
                            return false;
                        }
                    }
                    
                    // Type Filter - handle empty string or "ALL"
                    if (type != null && !type.isEmpty() && !type.equalsIgnoreCase("ALL")) {
                        if (d.getDisasterType() == null || !d.getDisasterType().name().equalsIgnoreCase(type)) {
                            return false;
                        }
                    }
                    
                    return true;
                }).collect(Collectors.toList());
    }


}
