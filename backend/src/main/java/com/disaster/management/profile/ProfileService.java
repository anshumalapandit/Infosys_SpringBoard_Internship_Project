package com.disaster.management.profile;

import com.disaster.management.entities.User;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    /**
     * Get current authenticated user's profile
     * Uses JWT token to identify user
     */
    public ProfileResponse getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToProfileResponse(user);
    }

    /**
     * Update current user's profile with location data
     * Essential for region-based disaster alerts (Milestone 1)
     */
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getEmail() != null && !request.getEmail().isBlank())
            user.setEmail(request.getEmail());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getRegion() != null)
            user.setRegion(request.getRegion());
        if (request.getCity() != null)
            user.setCity(request.getCity());
        if (request.getState() != null)
            user.setState(request.getState());
        if (request.getPincode() != null)
            user.setPincode(request.getPincode());
        if (request.getLatitude() != null)
            user.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            user.setLongitude(request.getLongitude());

        userRepository.save(user);
        return mapToProfileResponse(user);
    }

    private ProfileResponse mapToProfileResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .region(user.getRegion())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .role(user.getRole().name())
                .responderType(user.getResponderType())
                .badgeNumber(user.getBadgeNumber())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .build();
    }
}
