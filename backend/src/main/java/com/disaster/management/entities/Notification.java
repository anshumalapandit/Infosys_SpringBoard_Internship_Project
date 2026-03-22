package com.disaster.management.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Notification entity - stores alert notifications sent to users for a
 * disaster.
 * Each notification targets one user in the affected zone.
 */
@Entity
@Table(name = "notifications", indexes = {
                @Index(name = "idx_notif_user", columnList = "userId"),
                @Index(name = "idx_notif_disaster", columnList = "disasterId"),
                @Index(name = "idx_notif_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        /** The disaster event this notification is about */
        @Column(nullable = true)
        private Long disasterId;

        /** The recipient user */
        @Column(nullable = false)
        private Long userId;

        /** Pre-built human-readable alert message */
        @Column(columnDefinition = "TEXT", nullable = false)
        private String message;

        /** When the notification was dispatched */
        @Column(nullable = false)
        private LocalDateTime sentAt;

        /** SENT → READ lifecycle */
        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private NotificationStatus status;

        /**
         * Region/zone this notification targets (denormalized for fast zone queries)
         */
        private String targetRegion;

        /** Role of the recipient at broadcast time (CITIZEN / RESPONDER) */
        private String recipientRole;
}
