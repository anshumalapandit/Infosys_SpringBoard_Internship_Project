package com.disaster.management.controllers;

import com.disaster.management.dto.BroadcastAlertRequest;
import com.disaster.management.dto.BroadcastAlertResponse;
import com.disaster.management.entities.AlertAcknowledgment;
import com.disaster.management.entities.Notification;
import com.disaster.management.repositories.NotificationRepository;
import com.disaster.management.services.AlertBroadcastService;
import com.disaster.management.services.ResponderAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AdminAlertController – ADMIN-only alert broadcasting and audit endpoints.
 *
 * POST /api/admin/alerts/broadcast → Broadcast alert for a verified disaster
 * GET /api/admin/alerts/disaster/{id} → All notifications sent for a disaster
 * GET /api/admin/alerts/acks/{disasterId} → Responder acknowledgments for a
 * disaster
 * GET /api/admin/alerts/acks/{disasterId}/ready-count → Count of READY
 * responders
 */
@RestController
@RequestMapping("/api/admin/alerts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAlertController {

    private final AlertBroadcastService broadcastService;
    private final ResponderAlertService responderAlertService;
    private final NotificationRepository notificationRepository;

    /**
     * Broadcast an alert for a VERIFIED disaster.
     * Optionally filter by region; if omitted, all users are notified.
     */
    @PostMapping("/broadcast")
    public ResponseEntity<BroadcastAlertResponse> broadcastAlert(
            @Valid @RequestBody BroadcastAlertRequest request) {
        BroadcastAlertResponse response = broadcastService.broadcastAlert(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all notifications sent for a specific disaster (audit log).
     */
    @GetMapping("/disaster/{disasterId}")
    public ResponseEntity<List<Notification>> getNotificationsForDisaster(
            @PathVariable("disasterId") Long disasterId) {
        return ResponseEntity.ok(notificationRepository.findByDisasterId(disasterId));
    }

    /**
     * Get all responder acknowledgments for a disaster (response efficiency audit).
     */
    @GetMapping("/acks/{disasterId}")
    public ResponseEntity<List<AlertAcknowledgment>> getAcknowledgments(
            @PathVariable("disasterId") Long disasterId) {
        return ResponseEntity.ok(responderAlertService.getAcknowledgmentsForDisaster(disasterId));
    }

    /**
     * Count of READY responders for a disaster (dashboard KPI).
     */
    @GetMapping("/acks/{disasterId}/ready-count")
    public ResponseEntity<Map<String, Long>> getReadyResponderCount(
            @PathVariable("disasterId") Long disasterId) {
        long count = responderAlertService.countReadyResponders(disasterId);
        return ResponseEntity.ok(Map.of("readyResponders", count));
    }
}
