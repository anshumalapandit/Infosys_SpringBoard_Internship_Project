package com.disaster.management.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * HelpRequest – submitted by citizens during a disaster.
 * The nearest available responder is auto-assigned using Haversine distance.
 */
@Entity
@Table(name = "help_requests",
        indexes = {
                @Index(name = "idx_help_citizen", columnList = "citizenId"),
                @Index(name = "idx_help_responder", columnList = "assignedResponderId"),
                @Index(name = "idx_help_status", columnList = "status")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The citizen who raised the request */
    @Column(nullable = false)
    private Long citizenId;

    /** Auto-assigned nearest available responder (null until assignment) */
    private Long assignedResponderId;

    /** Human-readable description of the emergency */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    /** Citizen's GPS latitude at time of request */
    @Column(nullable = false)
    private Double latitude;

    /** Citizen's GPS longitude at time of request */
    @Column(nullable = false)
    private Double longitude;

    /** Reverse-geocoded or user-provided location label */
    private String locationLabel;

    /** PENDING → ASSIGNED → COMPLETED */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelpRequestStatus status;

    /** Timestamp when request was created */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /** Timestamp when a responder was assigned */
    private LocalDateTime assignedAt;

    /** Timestamp when request was marked completed */
    private LocalDateTime completedAt;

    /** Haversine distance (km) to the assigned responder at assignment time */
    private Double distanceToResponderKm;
}
