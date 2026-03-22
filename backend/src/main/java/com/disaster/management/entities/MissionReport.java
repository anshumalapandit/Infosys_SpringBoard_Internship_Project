package com.disaster.management.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "mission_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissionReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private Long responderId;

    @Column(columnDefinition = "TEXT")
    private String reportNotes;

    @ElementCollection
    @CollectionTable(name = "report_images", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();
}
