package com.disaster.management.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private String phone;
    private String region;
    private String city;
    private String state;
    private String pincode;
    // Responder GPS location
    private Double latitude;
    private Double longitude;
    private String badgeNumber;
    private String responderType;
}
