package com.disaster.management.auth;

import com.disaster.management.security.JwtService;
import com.disaster.management.entities.Role;
import com.disaster.management.entities.User;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthenticationResponse register(RegisterRequest request) {
                System.out.println("Service: Registering user: " + request.getUsername());
                if (repository.findByUsername(request.getUsername()).isPresent()) {
                        throw new RuntimeException("Username already exists");
                }
                if (repository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }
                var user = User.builder()
                                .fullName(request.getFullName())
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : Role.ROLE_CITIZEN)
                                // Profile with location data (Milestone 1)
                                .phone(request.getPhone())
                                .region(request.getRegion())
                                .city(request.getCity())
                                .state(request.getState())
                                .pincode(request.getPincode())
                                // Role-specific fields
                                .responderType(request.getResponderType())
                                .badgeNumber(request.getBadgeNumber())
                                .departmentAccessCode(request.getAccessCode())
                                .build();
                System.out.println("Service: Saving user to database...");
                user = repository.save(user);
                System.out.println("Service: User saved with ID: " + user.getId());
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .username(user.getUsername())
                                .fullName(user.getFullName())
                                .userId(user.getId())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                System.out.println("Service: Authenticating user: " + request.getUsername());
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                System.out.println("Service: Authentication manager validated credentials.");
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .username(user.getUsername())
                                .fullName(user.getFullName())
                                .userId(user.getId())
                                .build();
        }
}
