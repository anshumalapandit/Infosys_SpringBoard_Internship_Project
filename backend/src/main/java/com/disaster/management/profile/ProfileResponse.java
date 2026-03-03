package com.disaster.management.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String region;
    private String city;
    private String state;
    private String pincode;
    private String role;

    // Role-specific fields
    private String responderType;
    private String badgeNumber;

    // Responder GPS location
    private Double latitude;
    private Double longitude;
}
