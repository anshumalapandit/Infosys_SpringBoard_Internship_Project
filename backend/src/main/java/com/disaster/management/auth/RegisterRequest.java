package com.disaster.management.auth;

import com.disaster.management.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String username;
    private String email;
    private String password;
    private Role role;

    // Profile data with location
    private String phone;
    private String region;
    private String city;
    private String state;
    private String pincode;

    // Role-specific fields
    private String responderType;
    private String badgeNumber;
    private String accessCode;
}
