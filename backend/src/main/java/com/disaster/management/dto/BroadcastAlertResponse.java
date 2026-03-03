package com.disaster.management.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Response returned after a broadcast, summarising how many notifications were
 * sent.
 */
@Data
@Builder
public class BroadcastAlertResponse {

    private Long disasterId;
    private String disasterTitle;
    private int notificationsSent;
    private String targetRegion;
    private String message;
}
