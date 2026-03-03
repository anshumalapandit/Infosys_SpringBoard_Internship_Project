package com.disaster.management.controllers;

import com.disaster.management.dto.HelpRequestDTO;
import com.disaster.management.dto.HelpRequestResponse;
import com.disaster.management.entities.HelpRequest;
import com.disaster.management.entities.Notification;
import com.disaster.management.entities.NotificationStatus;
import com.disaster.management.repositories.NotificationRepository;
import com.disaster.management.repositories.UserRepository;
import com.disaster.management.services.CitizenHelpRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CitizenController – endpoints exclusively for ROLE_CITIZEN.
 *
 * POST /api/citizen/help-request → Submit emergency help request
 * GET /api/citizen/help-request/my-requests → View my submitted requests
 * GET /api/citizen/notifications → View my notification inbox
 * PATCH /api/citizen/notifications/{id}/read → Mark notification as READ
 * GET /api/citizen/notifications/unread-count → Count unread notifications
 */
@RestController
@RequestMapping("/api/citizen")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CITIZEN')")
public class CitizenController {

    private final CitizenHelpRequestService helpRequestService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // --------------------------------------------------------------------------
    // Help Requests
    // --------------------------------------------------------------------------

    /**
     * POST /api/citizen/help-request
     * Citizen submits an emergency help request.
     * The nearest available responder is auto-assigned by-the-service.
     */
    @PostMapping("/help-request")
    public ResponseEntity<HelpRequestResponse> submitHelpRequest(
            @Valid @RequestBody HelpRequestDTO dto,
            Authentication auth) {

        Long citizenId = resolveUserId(auth);
        HelpRequestResponse response = helpRequestService.submitHelpRequest(citizenId, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/citizen/help-request/my-requests
     * Citizen views all their own help requests.
     */
    @GetMapping("/help-request/my-requests")
    public ResponseEntity<List<HelpRequest>> getMyRequests(Authentication auth) {
        Long citizenId = resolveUserId(auth);
        return ResponseEntity.ok(helpRequestService.getMyCitizenRequests(citizenId));
    }

    // --------------------------------------------------------------------------
    // Notifications (Inbox)
    // --------------------------------------------------------------------------

    /**
     * GET /api/citizen/notifications
     * Full notification inbox for the citizen, newest first.
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        Long citizenId = resolveUserId(auth);
        return ResponseEntity.ok(
                notificationRepository.findByUserIdOrderBySentAtDesc(citizenId));
    }

    /**
     * PATCH /api/citizen/notifications/{id}/read
     * Mark a single notification as READ (updates status).
     */
    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id, Authentication auth) {
        Long citizenId = resolveUserId(auth);
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));

        // Security: only the owner can mark it read
        if (!notif.getUserId().equals(citizenId)) {
            return ResponseEntity.status(403).build();
        }

        notif.setStatus(NotificationStatus.READ);
        return ResponseEntity.ok(notificationRepository.save(notif));
    }

    /**
     * GET /api/citizen/notifications/unread-count
     * Quick count for the UI notification badge.
     */
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long citizenId = resolveUserId(auth);
        long count = notificationRepository.countByUserIdAndStatus(citizenId, NotificationStatus.SENT);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // --------------------------------------------------------------------------
    // Private helpers
    // --------------------------------------------------------------------------

    private Long resolveUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
