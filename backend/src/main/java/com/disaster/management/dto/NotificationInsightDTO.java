package com.disaster.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationInsightDTO {
    private long totalBroadcasted;
    private long totalAcknowledged;
    private long totalIgnored;
    private double acknowledgmentRate;
    private double ignoredRate;
    private double engagementRate; // Keeping for compatibility
}
