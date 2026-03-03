package com.disaster.management.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/admin/alerts/broadcast
 */
@Data
public class BroadcastAlertRequest {

    @NotNull(message = "disasterId is required")
    private Long disasterId;

    /** Optional override message; if blank, a default message is auto-generated */
    private String customMessage;

    /**
     * Target region filter. When provided, only users whose `region` matches this
     * value receive the notification. Leave null/blank to notify ALL users.
     */
    private String targetRegion;
}
