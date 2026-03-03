package com.disaster.management.services;

import com.disaster.management.dto.HelpRequestDTO;
import com.disaster.management.dto.HelpRequestResponse;
import com.disaster.management.entities.*;
import com.disaster.management.repositories.HelpRequestRepository;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * CitizenHelpRequestService – Milestone 3 Feature 3.
 *
 * Core algorithm:
 * 1. Validate citizen identity.
 * 2. Find all available responders with known GPS coordinates.
 * 3. Compute Haversine distance from citizen to each responder.
 * 4. Assign the nearest one (tie-break: lowest active workload).
 * 5. Persist HelpRequest and return enriched response.
 * 6. Push real-time SSE notifications to all admins and responders.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenHelpRequestService {

    private final HelpRequestRepository helpRequestRepository;
    private final UserRepository userRepository;
    private final SseNotificationService sseNotificationService;

    /** Earth radius in km – used in Haversine formula */
    private static final double EARTH_RADIUS_KM = 6371.0;

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    /**
     * Citizen submits a help request. Auto-assigns the nearest available responder.
     */
    @Transactional
    public HelpRequestResponse submitHelpRequest(Long citizenId, HelpRequestDTO dto) {

        // Sanity check: citizen exists
        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found: " + citizenId));

        // Find nearest available responder to notify (but NOT auto-assign)
        Optional<User> nearestResponder = findNearestAvailableResponder(dto.getLatitude(), dto.getLongitude());

        HelpRequest helpRequest = HelpRequest.builder()
                .citizenId(citizenId)
                .description(dto.getDescription())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .locationLabel(dto.getLocationLabel())
                .status(HelpRequestStatus.PENDING) // Always starts PENDING
                .createdAt(LocalDateTime.now())
                .build();

        // Store the suggested responder ID for reference, but keep status PENDING
        // The responder must explicitly accept before status moves to ASSIGNED
        if (nearestResponder.isPresent()) {
            User responder = nearestResponder.get();
            double distanceKm = haversineKm(dto.getLatitude(), dto.getLongitude(),
                    responder.getLatitude(), responder.getLongitude());
            helpRequest.setAssignedResponderId(responder.getId());
            helpRequest.setDistanceToResponderKm(distanceKm);
            log.info("Nearest responder {} identified for citizen {} ({} km) – notifying, status stays PENDING",
                    responder.getId(), citizenId, String.format("%.2f", distanceKm));
        } else {
            log.warn("No available responders found for citizen {}. Request is PENDING.", citizenId);
        }

        HelpRequest saved = helpRequestRepository.save(helpRequest);

        // Notify admins & the nearest responder via SSE
        notifyAdminsAndResponders(saved, citizen, dto);

        return buildResponse(saved, nearestResponder.orElse(null));
    }

    /**
     * Responder explicitly accepts a help request.
     * Moves status from PENDING → ASSIGNED.
     */
    @Transactional
    public HelpRequest acceptHelpRequest(Long requestId, Long responderId) {
        HelpRequest req = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("HelpRequest not found: " + requestId));

        if (req.getStatus() != HelpRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING requests can be accepted. Current status: " + req.getStatus());
        }

        req.setAssignedResponderId(responderId);
        req.setStatus(HelpRequestStatus.ASSIGNED);
        req.setAssignedAt(LocalDateTime.now());
        HelpRequest saved = helpRequestRepository.save(req);
        log.info("Responder {} accepted help request {}", responderId, requestId);
        return saved;
    }

    /**
     * Citizen views their own help request history.
     */
    public List<HelpRequest> getMyCitizenRequests(Long citizenId) {
        return helpRequestRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
    }

    /**
     * Responder views help requests assigned to them.
     */
    public List<HelpRequest> getMyResponderRequests(Long responderId) {
        return helpRequestRepository.findByAssignedResponderId(responderId);
    }

    /**
     * Responder or Admin marks a request as COMPLETED.
     */
    @Transactional
    public HelpRequest completeHelpRequest(Long requestId, Long responderId) {
        HelpRequest req = helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("HelpRequest not found: " + requestId));

        if (!responderId.equals(req.getAssignedResponderId())) {
            throw new IllegalStateException("Only the assigned responder can complete this request.");
        }
        req.setStatus(HelpRequestStatus.COMPLETED);
        req.setCompletedAt(LocalDateTime.now());
        return helpRequestRepository.save(req);
    }

    // ---------------------------------------------------------------------------
    // SSE Notification helpers
    // ---------------------------------------------------------------------------

    /**
     * Push a real-time HELP_REQUEST notification to all admins and responders
     * so they receive an instant alert when a citizen submits an emergency report.
     */
    private void notifyAdminsAndResponders(HelpRequest helpRequest, User citizen, HelpRequestDTO dto) {
        try {
            String emergencyType = (dto.getEmergencyType() != null && !dto.getEmergencyType().isBlank())
                    ? dto.getEmergencyType()
                    : "OTHER";
            String location = (dto.getLocationLabel() != null && !dto.getLocationLabel().isBlank())
                    ? dto.getLocationLabel()
                    : "Unknown Location";
            String citizenName = citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername();

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "HELP_REQUEST");
            payload.put("helpRequestId", helpRequest.getId());
            payload.put("citizenId", helpRequest.getCitizenId());
            payload.put("citizenName", citizenName);
            payload.put("emergencyType", emergencyType);
            payload.put("description", helpRequest.getDescription());
            payload.put("location", location);
            payload.put("status", helpRequest.getStatus().name());
            payload.put("createdAt", helpRequest.getCreatedAt().toString());
            payload.put("message", "🆘 CITIZEN HELP REQUEST: " + emergencyType + " at " + location
                    + " — reported by " + citizenName);

            // Collect all admin + responder user IDs
            List<User> admins = userRepository.findAllByRole(Role.ROLE_ADMIN);
            List<User> responders = userRepository.findAllByRole(Role.ROLE_RESPONDER);

            List<Long> adminIds = admins.stream().map(User::getId).toList();
            List<Long> responderIds = responders.stream().map(User::getId).toList();

            if (!adminIds.isEmpty()) {
                sseNotificationService.sendToUsersAsync(adminIds, "HELP_REQUEST", payload);
                log.info("Pushed HELP_REQUEST SSE to {} admins", adminIds.size());
            }

            if (!responderIds.isEmpty()) {
                sseNotificationService.sendToUsersAsync(responderIds, "HELP_REQUEST", payload);
                log.info("Pushed HELP_REQUEST SSE to {} responders", responderIds.size());
            }

        } catch (Exception e) {
            log.error("Failed to push SSE notifications for help request {}", helpRequest.getId(), e);
        }
    }

    // ---------------------------------------------------------------------------
    // Haversine algorithm
    // ---------------------------------------------------------------------------

    /**
     * Haversine formula – great-circle distance between two GPS points (in km).
     *
     * Formula:
     * a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
     * c = 2·atan2(√a, √(1−a))
     * d = R·c
     */
    public double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------

    private Optional<User> findNearestAvailableResponder(double citizenLat, double citizenLon) {
        List<User> candidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_RESPONDER)
                .filter(User::isAvailable)
                .filter(u -> u.getLatitude() != null && u.getLongitude() != null)
                .toList();

        if (candidates.isEmpty()) {
            return Optional.empty();
        }

        return candidates.stream()
                .min(Comparator.comparingDouble(
                        responder -> haversineKm(citizenLat, citizenLon,
                                responder.getLatitude(), responder.getLongitude())));
    }

    private HelpRequestResponse buildResponse(HelpRequest req, User responder) {
        return HelpRequestResponse.builder()
                .id(req.getId())
                .description(req.getDescription())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .locationLabel(req.getLocationLabel())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .assignedAt(req.getAssignedAt())
                .assignedResponderName(responder != null ? responder.getFullName() : null)
                .assignedResponderType(responder != null ? responder.getResponderType() : null)
                .distanceToResponderKm(req.getDistanceToResponderKm())
                .build();
    }
}
