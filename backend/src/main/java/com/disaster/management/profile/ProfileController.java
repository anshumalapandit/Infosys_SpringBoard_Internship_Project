package com.disaster.management.profile;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Profile Controller - Protected Endpoints (Milestone 1)
 * All endpoints require valid JWT token
 * Demonstrates role-based access control and profile management with location
 * data
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Get current user's profile
     * Protected endpoint - requires JWT token
     * Accessible by all authenticated users
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getCurrentUserProfile());
    }

    /**
     * Update current user's profile with location data
     * Protected endpoint - requires JWT token
     * Location data is crucial for region-based disaster alerts
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
}
