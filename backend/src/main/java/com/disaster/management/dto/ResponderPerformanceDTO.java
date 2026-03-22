package com.disaster.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponderPerformanceDTO {
    private String responderName;
    private long tasksAssigned;
    private long tasksCompleted;
    private double completionRate;
}
