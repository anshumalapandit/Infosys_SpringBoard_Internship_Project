package com.disaster.management.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * AlertAcknowledgment – records when a responder confirms receipt of an alert.
 * Tracks readiness so dispatch coordinators know who is available.
 */
@Entity
@Table(name = "alert_acknowledgments",
        indexes = {
                @Index(name = "idx_ack_responder", columnList = "responderId"),
                @Index(name = "idx_ack_disaster", columnList = "disasterId")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertAcknowledgment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long responderId;

    @Column(nullable = false)
    private Long disasterId;

    /** Timestamp when the responder clicked "Acknowledge" */
    @Column(nullable = false)
    private LocalDateTime acknowledgedAt;

    /** Whether the responder is ready to be deployed */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadinessStatus readinessStatus;

    /** Optional free-text notes from the responder */
    @Column(columnDefinition = "TEXT")
    private String notes;
}
