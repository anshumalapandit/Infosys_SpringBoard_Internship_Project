package com.disaster.management.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Enriched view of a HelpRequest for the admin dashboard.
 * Includes citizen name (looked up from User) and parsed emergency type.
 */
@Data
@Builder
public class HelpRequestAdminView {
    private Long id;
    private Long citizenId;
    private String citizenName;
    private String emergencyType;
    private String description;
    private String locationLabel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private Double distanceToResponderKm;
    private Long assignedResponderId;
}
