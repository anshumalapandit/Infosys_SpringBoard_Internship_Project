package com.disaster.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescueTaskAssignmentDTO {
    private Long disasterId;
    private Long responderId;
    private String description;
    private Long helpRequestId;
}
