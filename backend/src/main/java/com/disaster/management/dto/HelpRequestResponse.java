package com.disaster.management.dto;

import com.disaster.management.entities.HelpRequestStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Response DTO for HelpRequest – safe to return to the citizen (no sensitive
 * responder PII).
 */
@Data
@Builder
public class HelpRequestResponse {

    private Long id;
    private String description;
    private Double latitude;
    private Double longitude;
    private String locationLabel;
    private HelpRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;

    /** Responder's display name (null if not yet assigned) */
    private String assignedResponderName;

    /** Responder's type (POLICE / FIRE / MEDICAL) */
    private String assignedResponderType;

    /** Distance in km between citizen and assigned responder */
    private Double distanceToResponderKm;
}
