package com.disaster.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HighRiskAreaDTO {
    private String location;
    private long disasterCount;
    private String riskLevel; // LOW, MEDIUM, HIGH
}
