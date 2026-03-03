package com.disaster.management.services;

import com.disaster.management.dto.AcknowledgeAlertRequest;
import com.disaster.management.entities.AlertAcknowledgment;
import com.disaster.management.entities.Role;
import com.disaster.management.entities.User;
import com.disaster.management.repositories.AlertAcknowledgmentRepository;
import com.disaster.management.repositories.DisasterEventRepository;
import com.disaster.management.repositories.NotificationRepository;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ResponderAlertService – Milestone 3 Feature 2.
 *
 * Handles responder acknowledgment workflow:
 * 1. Validate disaster exists.
 * 2. Prevent duplicate acknowledgments (idempotent).
 * 3. Persist AlertAcknowledgment with timestamp + readiness.
 * 4. Provides admin-facing audit queries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResponderAlertService {

        private final AlertAcknowledgmentRepository acknowledgmentRepository;
        private final DisasterEventRepository disasterEventRepository;
        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;
        private final SseNotificationService sseNotificationService;

        /**
         * Responder acknowledges an alert for a given disaster.
         * 
         * @param responderId User ID of the authenticated responder
         * @param disasterId  Disaster the alert belongs to
         * @param request     Readiness + optional notes
         * @return Saved acknowledgment entity
         */
        @Transactional
        public AlertAcknowledgment acknowledgeAlert(Long responderId, Long disasterId,
                        AcknowledgeAlertRequest request) {

                // Validate disaster exists
                disasterEventRepository.findById(disasterId)
                                .orElseThrow(() -> new RuntimeException("Disaster not found: " + disasterId));

                // Idempotency guard – one acknowledgment per responder per disaster
                acknowledgmentRepository.findByResponderIdAndDisasterId(responderId, disasterId)
                                .ifPresent(existing -> {
                                        throw new IllegalStateException(
                                                        String.format("Responder %d has already acknowledged disaster %d at %s",
                                                                        responderId, disasterId,
                                                                        existing.getAcknowledgedAt()));
                                });

                AlertAcknowledgment ack = AlertAcknowledgment.builder()
                                .responderId(responderId)
                                .disasterId(disasterId)
                                .acknowledgedAt(LocalDateTime.now())
                                .readinessStatus(request.getReadinessStatus())
                                .notes(request.getNotes())
                                .build();

                AlertAcknowledgment saved = acknowledgmentRepository.save(ack);
                log.info("Responder {} acknowledged disaster {} as {}", responderId, disasterId,
                                request.getReadinessStatus());

                // Notify admins in real-time (Milestone 3 Feature 2 SSE flow)
                pushAckUpdateToAdmins(saved);

                return saved;
        }

        /**
         * Background utility to notify all admins when a responder acknowledges an
         * alert.
         * Ensures the admin dashboard count stays in sync without manual refresh.
         */
        private void pushAckUpdateToAdmins(AlertAcknowledgment ack) {
                try {
                        User responder = userRepository.findById(ack.getResponderId()).orElse(null);
                        List<User> admins = userRepository.findAllByRole(Role.ROLE_ADMIN);

                        if (admins.isEmpty())
                                return;

                        Map<String, Object> payload = Map.of(
                                        "type", "ACK_UPDATE",
                                        "disasterId", ack.getDisasterId(),
                                        "responderId", ack.getResponderId(),
                                        "responderName",
                                        (responder != null) ? responder.getFullName()
                                                        : "Responder #" + ack.getResponderId(),
                                        "status", ack.getReadinessStatus().name(),
                                        "acknowledgedAt", ack.getAcknowledgedAt().toString(),
                                        "newReadyCount", countReadyResponders(ack.getDisasterId()));

                        List<Long> adminIds = admins.stream().map(User::getId).toList();
                        sseNotificationService.sendToUsersAsync(adminIds, "ACK_UPDATE", payload);
                        log.info("Dispatched real-time ACK_UPDATE to {} admins", adminIds.size());
                } catch (Exception e) {
                        log.error("Failed to push admin SSE notification for acknowledgment", e);
                }
        }

        /**
         * Returns all acknowledgments for a specific disaster (admin audit view).
         */
        public List<AlertAcknowledgment> getAcknowledgmentsForDisaster(Long disasterId) {
                return acknowledgmentRepository.findByDisasterIdOrderByAcknowledgedAtAsc(disasterId);
        }

        /**
         * Returns a specific responder's acknowledgment history.
         */
        public List<AlertAcknowledgment> getResponderHistory(Long responderId) {
                return acknowledgmentRepository.findByResponderId(responderId);
        }

        /**
         * Counts READY responders for a given disaster (for dashboard KPIs).
         */
        public long countReadyResponders(Long disasterId) {
                return acknowledgmentRepository.countByDisasterIdAndReadinessStatus(
                                disasterId, com.disaster.management.entities.ReadinessStatus.READY);
        }
}
