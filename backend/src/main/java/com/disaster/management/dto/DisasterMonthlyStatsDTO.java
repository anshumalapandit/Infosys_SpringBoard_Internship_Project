package com.disaster.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisasterMonthlyStatsDTO {
    private String period; // e.g. "2024-03"
    private long count;
}
