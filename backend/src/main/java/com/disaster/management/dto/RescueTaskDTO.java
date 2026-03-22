package com.disaster.management.dto;

import com.disaster.management.entities.RescueTaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescueTaskDTO {
    private Long taskId;
    private Long disasterId;
    private String zoneName;
    private String disasterType;
    private String description;
    private RescueTaskStatus status;
    private LocalDateTime assignedAt;
    private Double latitude;
    private Double longitude;
    private String responderName;
    private String responderEmail;
    private String reportNotes;
    private java.util.List<String> imageUrls;
}
