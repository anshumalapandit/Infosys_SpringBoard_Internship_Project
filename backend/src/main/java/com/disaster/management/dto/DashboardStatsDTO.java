package com.disaster.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long activeDisasters;
    private long criticalAlerts;
    private long pendingReviews;
    private long activeResponders;
}
