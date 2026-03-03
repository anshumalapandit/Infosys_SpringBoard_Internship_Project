package com.disaster.management.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) {
        try {
            System.out.println("Processing registration request for user: " + request.getUsername());
            AuthenticationResponse response = service.register(request);
            System.out.println("Registration successful for user: " + request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("REGISTRATION FAILED for user: " + request.getUsername());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        try {
            System.out.println("Processing login request for user: " + request.getUsername());
            AuthenticationResponse response = service.authenticate(request);
            System.out.println("Login successful for user: " + request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("LOGIN FAILED for user: " + request.getUsername());
            e.printStackTrace();
            throw e;
        }
    }
}
