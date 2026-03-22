package com.disaster.management.controllers;

import com.disaster.management.dto.DashboardStatsDTO;
import com.disaster.management.dto.HelpRequestAdminView;
import com.disaster.management.entities.*;
import com.disaster.management.repositories.DisasterEventRepository;
import com.disaster.management.repositories.HelpRequestRepository;
import com.disaster.management.repositories.UserRepository;
import com.disaster.management.repositories.*;
import lombok.RequiredArgsConstructor;
import com.disaster.management.services.SseNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final DisasterEventRepository disasterRepository;
    private final UserRepository userRepository;
    private final HelpRequestRepository helpRequestRepository;
    private final ResponderMessageRepository responderMessageRepository;
    private final NotificationRepository notificationRepository;
    private final SseNotificationService sseService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .activeDisasters(disasterRepository.countByStatus(DisasterStatus.VERIFIED))
                .criticalAlerts(
                        disasterRepository.countBySeverityAndStatus(SeverityLevel.CRITICAL, DisasterStatus.VERIFIED))
                .pendingReviews(disasterRepository.countByStatus(DisasterStatus.PENDING))
                .activeResponders(userRepository.countByRole(Role.ROLE_RESPONDER))
                .build();
        System.out.println("Returning Dashboard Stats: " + stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/responders")
    public ResponseEntity<List<User>> getResponders() {
        List<User> responders = userRepository.findAllByRole(Role.ROLE_RESPONDER);
        System.out.println("DEBUG: Found " + responders.size() + " responders in DB");
        return ResponseEntity.ok(responders);
    }

    /**
     * GET /api/admin/dashboard/help-requests
     * Admin views all citizen help requests – enriched with citizen name
     * and emergency type parsed from the description prefix.
     */
    @GetMapping("/help-requests")
    public ResponseEntity<List<HelpRequestAdminView>> getAllHelpRequests() {
        List<HelpRequest> requests = helpRequestRepository.findAll();

        // Sort newest first
        requests.sort((a, b) -> {
            if (b.getCreatedAt() == null)
                return -1;
            if (a.getCreatedAt() == null)
                return 1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        Pattern typePattern = Pattern.compile("^\\[([A-Z]+)]\\s*");

        List<HelpRequestAdminView> views = requests.stream().map(req -> {
            // Look up citizen name
            String citizenName = userRepository.findById(req.getCitizenId())
                    .map(u -> u.getFullName() != null && !u.getFullName().isBlank()
                            ? u.getFullName()
                            : u.getUsername())
                    .orElse("Citizen #" + req.getCitizenId());

            // Parse emergencyType from description prefix e.g. "[FIRE] some text"
            String rawDesc = req.getDescription() != null ? req.getDescription() : "";
            Matcher m = typePattern.matcher(rawDesc);
            String emergencyType = m.find() ? m.group(1) : "OTHER";
            String cleanDesc = rawDesc.replaceFirst("^\\[[A-Z]+]\\s*", "");

            return HelpRequestAdminView.builder()
                    .id(req.getId())
                    .citizenId(req.getCitizenId())
                    .citizenName(citizenName)
                    .emergencyType(emergencyType)
                    .description(cleanDesc)
                    .locationLabel(req.getLocationLabel())
                    .status(req.getStatus().name())
                    .createdAt(req.getCreatedAt())
                    .assignedAt(req.getAssignedAt())
                    .completedAt(req.getCompletedAt())
                    .distanceToResponderKm(req.getDistanceToResponderKm())
                    .assignedResponderId(req.getAssignedResponderId())
                    .build();
        }).collect(Collectors.toList());

        System.out.println("DEBUG: Returning " + views.size() + " help requests to admin");
        return ResponseEntity.ok(views);
    }

    @PostMapping("/responders/{id}/message")
    public ResponseEntity<java.util.Map<String, String>> sendMessage(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, Object> body) {
        
        System.out.println("DEBUG: Incoming message request for responder ID: " + id);
        String message = body.get("message") != null ? body.get("message").toString() : "";
        String priority = body.get("priority") != null ? body.get("priority").toString() : "NORMAL";
        System.out.println("DEBUG: Message content: " + message + ", Priority: " + priority);

        try {
            // 1. Verify responder exists 
            User responder = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Responder not found with ID: " + id));

            // 2. Save Message and Notification records first (Database integrity)
            ResponderMessage msg = ResponderMessage.builder()
                    .responderId(id)
                    .message(message)
                    .priority(priority)
                    .createdAt(java.time.LocalDateTime.now())
                    .isRead(false)
                    .build();
            responderMessageRepository.save(msg);

            Notification notification = Notification.builder()
                    .disasterId(0L) 
                    .userId(id)
                    .message("[Control Center Message]\n" + message + "\nPriority: " + priority)
                    .sentAt(java.time.LocalDateTime.now())
                    .status(NotificationStatus.SENT)
                    .targetRegion("ADMIN_DIRECT")
                    .recipientRole("RESPONDER")
                    .build();
            notificationRepository.save(notification);
            System.out.println("DEBUG: DB write successful for responder: " + id);

            // 3. Fire-and-forget SSE update (to prevent UI hang if SSE is slow)
            new Thread(() -> {
                try {
                    java.util.Map<String, Object> ssePayload = new java.util.HashMap<>();
                    ssePayload.put("id", notification.getId());
                    ssePayload.put("title", "New Admin Message");
                    ssePayload.put("message", message);
                    ssePayload.put("severity", priority);
                    ssePayload.put("sentAt", java.time.LocalDateTime.now().toString());
                    ssePayload.put("targetRegion", "ADMIN_DIRECT");
                    ssePayload.put("disasterId", 0L);
                    
                    sseService.sendToUser(id, "ALERT", ssePayload);
                    System.out.println("DEBUG: Background SSE delivery attempt finished for: " + id);
                } catch (Exception e) {
                    System.err.println("DEBUG: SSE background push failed: " + e.getMessage());
                }
            }).start();

            // Return immediately - the "Sending..." modal will close on the frontend
            return ResponseEntity.ok(java.util.Map.of("status", "success", "info", "Message processing initiated"));
        } catch (Exception ex) {
            System.err.println("DEBUG: CRITICAL ERROR in sendMessage: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
