package com.disaster.management.dto;

import com.disaster.management.entities.ReadinessStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/responder/alerts/{id}/acknowledge
 */
@Data
public class AcknowledgeAlertRequest {

    @NotNull(message = "readinessStatus is required")
    private ReadinessStatus readinessStatus;

    /** Optional notes (e.g., "On my way", "Need backup") */
    private String notes;
}
