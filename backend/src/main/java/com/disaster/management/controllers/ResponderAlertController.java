package com.disaster.management.controllers;

import com.disaster.management.dto.AcknowledgeAlertRequest;
import com.disaster.management.entities.AlertAcknowledgment;
import com.disaster.management.entities.HelpRequest;
import com.disaster.management.entities.Notification;
import com.disaster.management.repositories.NotificationRepository;
import com.disaster.management.repositories.UserRepository;
import com.disaster.management.services.CitizenHelpRequestService;
import com.disaster.management.services.ResponderAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ResponderAlertController – endpoints exclusively for ROLE_RESPONDER.
 *
 * POST /api/responder/alerts/{disasterId}/acknowledge → Acknowledge an alert
 * GET /api/responder/alerts/my-acks → Responder's ack history
 * GET /api/responder/alerts/my-notifications → Responder's notification inbox
 * GET /api/responder/help-requests/assigned → Help requests assigned to me
 * POST /api/responder/help-requests/{id}/complete → Mark a request complete
 */
@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONDER')")
public class ResponderAlertController {

    private final ResponderAlertService responderAlertService;
    private final CitizenHelpRequestService citizenHelpRequestService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // --------------------------------------------------------------------------
    // Alert Acknowledgment
    // --------------------------------------------------------------------------

    /**
     * Responder acknowledges an alert.
     * POST /api/responder/alerts/{disasterId}/acknowledge
     */
    @PostMapping("/alerts/{disasterId}/acknowledge")
    public ResponseEntity<AlertAcknowledgment> acknowledgeAlert(
            @PathVariable Long disasterId,
            @Valid @RequestBody AcknowledgeAlertRequest request,
            Authentication auth) {

        Long responderId = resolveUserId(auth);
        AlertAcknowledgment ack = responderAlertService.acknowledgeAlert(responderId, disasterId, request);
        return ResponseEntity.ok(ack);
    }

    /**
     * Responder retrieves their own acknowledgment history.
     * GET /api/responder/alerts/my-acks
     */
    @GetMapping("/alerts/my-acks")
    public ResponseEntity<List<AlertAcknowledgment>> getMyAcks(Authentication auth) {
        Long responderId = resolveUserId(auth);
        return ResponseEntity.ok(responderAlertService.getResponderHistory(responderId));
    }

    /**
     * Responder notification inbox.
     * GET /api/responder/alerts/my-notifications
     */
    @GetMapping("/alerts/my-notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        Long responderId = resolveUserId(auth);
        return ResponseEntity.ok(
                notificationRepository.findByUserIdOrderBySentAtDesc(responderId));
    }

    // --------------------------------------------------------------------------
    // Help Request management (responder side)
    // --------------------------------------------------------------------------

    /**
     * Responder views help requests assigned to them.
     * GET /api/responder/help-requests/assigned
     */
    @GetMapping("/help-requests/assigned")
    public ResponseEntity<List<HelpRequest>> getAssignedRequests(Authentication auth) {
        Long responderId = resolveUserId(auth);
        return ResponseEntity.ok(citizenHelpRequestService.getMyResponderRequests(responderId));
    }

    /**
     * Responder explicitly accepts a PENDING help request → moves to ASSIGNED.
     * POST /api/responder/help-requests/{id}/accept
     */
    @PostMapping("/help-requests/{id}/accept")
    public ResponseEntity<HelpRequest> acceptRequest(
            @PathVariable Long id, Authentication auth) {
        Long responderId = resolveUserId(auth);
        return ResponseEntity.ok(citizenHelpRequestService.acceptHelpRequest(id, responderId));
    }

    /**
     * Responder marks a help request as COMPLETED.
     * POST /api/responder/help-requests/{id}/complete
     */
    @PostMapping("/help-requests/{id}/complete")
    public ResponseEntity<HelpRequest> completeRequest(
            @PathVariable Long id, Authentication auth) {
        Long responderId = resolveUserId(auth);
        return ResponseEntity.ok(citizenHelpRequestService.completeHelpRequest(id, responderId));
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
