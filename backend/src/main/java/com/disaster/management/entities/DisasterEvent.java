package com.disaster.management.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "disaster_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisasterEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private DisasterType disasterType;

    @Enumerated(EnumType.STRING)
    private SeverityLevel severity;

    private Double latitude;
    private Double longitude;
    private String locationName;
    private String source;
    private LocalDateTime eventTime;

    @Enumerated(EnumType.STRING)
    private DisasterStatus status;

    private LocalDateTime createdAt;
    private boolean broadcastAlertSent;
}
