package com.disaster.management.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/citizen/help-request
 */
@Data
public class HelpRequestDTO {

    @NotBlank(message = "description is required")
    private String description;

    @NotNull(message = "latitude is required")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitude;

    @NotNull(message = "longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitude;

    /** Optional human-readable location label (e.g., "Near City Hospital") */
    private String locationLabel;

    /** Emergency type e.g. FIRE, FLOOD, MEDICAL, CRIME, OTHER */
    private String emergencyType;
}
