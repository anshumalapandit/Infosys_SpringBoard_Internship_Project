package com.disaster.management.services;

import com.disaster.management.dto.BroadcastAlertRequest;
import com.disaster.management.dto.BroadcastAlertResponse;
import com.disaster.management.entities.*;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertBroadcastService {

        private final DisasterEventRepository disasterEventRepository;
        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;
        private final SseNotificationService sseNotificationService;

        @Transactional
        public BroadcastAlertResponse broadcastAlert(BroadcastAlertRequest request) {

                // 1. Fetch and validate disaster
                DisasterEvent disaster = disasterEventRepository.findById(request.getDisasterId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Disaster not found: " + request.getDisasterId()));

                if (disaster.getStatus() != DisasterStatus.VERIFIED) {
                        throw new IllegalStateException(
                                        "Alerts can only be broadcast for VERIFIED disasters. Current status: "
                                                        + disaster.getStatus());
                }

                // 2. Resolve target users
                List<User> targetUsers = resolveTargetUsers(request.getTargetRegion());

                if (targetUsers.isEmpty()) {
                        log.warn("No users found for region '{}'. Broadcast skipped.", request.getTargetRegion());
                        return BroadcastAlertResponse.builder()
                                        .disasterId(disaster.getId())
                                        .disasterTitle(disaster.getTitle())
                                        .notificationsSent(0)
                                        .targetRegion(request.getTargetRegion())
                                        .message("No users matched the target region.")
                                        .build();
                }

                // 3. Build the alert message
                String alertMessage = buildAlertMessage(disaster, request.getCustomMessage());

                // 4. Persist Notification rows in bulk
                LocalDateTime now = LocalDateTime.now();
                List<Notification> notifications = targetUsers.stream()
                                .map(user -> Notification.builder()
                                                .disasterId(disaster.getId())
                                                .userId(user.getId())
                                                .message(alertMessage)
                                                .sentAt(now)
                                                .status(NotificationStatus.SENT)
                                                .targetRegion(
                                                                (request.getTargetRegion() != null
                                                                                && !request.getTargetRegion().isBlank())
                                                                                                ? request.getTargetRegion()
                                                                                                : "ALL")
                                                .recipientRole(user.getRole().name())
                                                .build())
                                .collect(Collectors.toList());

                notificationRepository.saveAll(notifications);
                log.info("Persisted {} notifications for disasterId={}", notifications.size(), disaster.getId());

                // 5. Push SSE in background (non-blocking)
                Map<String, Object> ssePayload = Map.of(
                                "disasterId", disaster.getId(),
                                "title", disaster.getTitle(),
                                "severity", disaster.getSeverity().name(),
                                "message", alertMessage,
                                "sentAt", now.toString());

                List<Long> userIds = targetUsers.stream().map(User::getId).collect(Collectors.toList());
                sseNotificationService.sendToUsersAsync(userIds, ssePayload);

                // 6. Mark disaster as broadcast sent
                disaster.setBroadcastAlertSent(true);
                disasterEventRepository.save(disaster);

                return BroadcastAlertResponse.builder()
                                .disasterId(disaster.getId())
                                .disasterTitle(disaster.getTitle())
                                .notificationsSent(notifications.size())
                                .targetRegion(request.getTargetRegion() != null ? request.getTargetRegion() : "ALL")
                                .message(alertMessage)
                                .build();
        }

        // ---------------- HELPERS ----------------

        private List<User> resolveTargetUsers(String region) {
                if (region == null || region.isBlank()) {
                        return userRepository.findAll();
                }
                return userRepository.findByRegionIgnoreCase(region);
        }

        private String buildAlertMessage(DisasterEvent disaster, String customMessage) {
                if (customMessage != null && !customMessage.isBlank()) {
                        return customMessage;
                }
                return String.format(
                                "⚠️ DISASTER ALERT: %s | Severity: %s | Location: %s | Time: %s. " +
                                                "Please follow safety protocols issued by local authorities.",
                                disaster.getTitle(),
                                disaster.getSeverity(),
                                disaster.getLocationName() != null ? disaster.getLocationName() : "Unknown",
                                disaster.getEventTime() != null ? disaster.getEventTime().toString() : "N/A");
        }
}