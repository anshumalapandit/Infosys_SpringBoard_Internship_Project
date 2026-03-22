package com.disaster.management.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescueTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "disaster_id", nullable = true)
    private DisasterEvent disasterEvent;

    @ManyToOne
    @JoinColumn(name = "responder_id", nullable = false)
    private User responder;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private RescueTaskStatus status;

    private Double latitude;
    private Double longitude;

    private LocalDateTime assignedAt;

    @ManyToOne
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    private Long helpRequestId;

    @Builder.Default
    private boolean reportSubmitted = false;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = RescueTaskStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
