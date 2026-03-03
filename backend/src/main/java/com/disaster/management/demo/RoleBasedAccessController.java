package com.disaster.management.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Demo Controller - Role-Based Access Control (RBAC) Examples
 * Demonstrates Milestone 1 requirement: Different users have different
 * responsibilities
 * 
 * Security Implementation:
 * - JWT token is verified using middleware (JwtAuthenticationFilter)
 * - Role authorization middleware checks user role
 * - Unauthorized users receive 403 Forbidden
 */
@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RoleBasedAccessController {

    /**
     * Public endpoint - No authentication required
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        return ResponseEntity.ok(Map.of(
                "message", "This is a public endpoint",
                "access", "Anyone can access this"));
    }

    /**
     * Protected endpoint - Any authenticated user
     * Requires valid JWT token
     */
    @GetMapping("/protected")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> protectedEndpoint() {
        return ResponseEntity.ok(Map.of(
                "message", "You are authenticated!",
                "access", "All authenticated users can access this"));
    }

    /**
     * ADMIN ONLY - System Configuration
     * Controls system configuration, assigns rescue tasks, manages responders
     */
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> adminDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome Admin!",
                "access", "Only ADMIN can access this",
                "capabilities", "Assign rescue tasks, manage responders, configure system"));
    }

    /**
     * RESPONDER ONLY - Rescue Operations
     * Views assigned rescue operations, updates rescue status
     */
    @GetMapping("/responder/operations")
    @PreAuthorize("hasAuthority('ROLE_RESPONDER')")
    public ResponseEntity<Map<String, String>> responderOperations() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome Responder!",
                "access", "Only RESPONDER can access this",
                "capabilities", "View rescue operations, update status, communicate with admin"));
    }

    /**
     * CITIZEN ONLY - Emergency Requests
     * Views disaster alerts, requests emergency help
     */
    @GetMapping("/citizen/alerts")
    @PreAuthorize("hasAuthority('ROLE_CITIZEN')")
    public ResponseEntity<Map<String, String>> citizenAlerts() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome Citizen!",
                "access", "Only CITIZEN can access this",
                "capabilities", "View disaster alerts, request emergency help, share location"));
    }

    /**
     * ADMIN or RESPONDER - Emergency coordination
     * Example of multiple role access
     */
    @GetMapping("/emergency/coordinate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_RESPONDER')")
    public ResponseEntity<Map<String, String>> emergencyCoordination() {
        return ResponseEntity.ok(Map.of(
                "message", "Emergency Coordination Center",
                "access", "ADMIN and RESPONDER can access this",
                "purpose", "Coordinate disaster response efforts"));
    }
}
