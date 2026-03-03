package com.disaster.management.controllers;

import com.disaster.management.dto.DashboardStatsDTO;
import com.disaster.management.dto.HelpRequestAdminView;
import com.disaster.management.entities.*;
import com.disaster.management.repositories.DisasterEventRepository;
import com.disaster.management.repositories.HelpRequestRepository;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final DisasterEventRepository disasterRepository;
    private final UserRepository userRepository;
    private final HelpRequestRepository helpRequestRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .activeDisasters(disasterRepository.countByStatus(DisasterStatus.VERIFIED))
                .criticalAlerts(
                        disasterRepository.countBySeverityAndStatus(SeverityLevel.CRITICAL, DisasterStatus.VERIFIED))
                .pendingReviews(disasterRepository.countByStatus(DisasterStatus.PENDING))
                .activeResponders(userRepository.countByRole(Role.ROLE_RESPONDER))
                .build();
        System.out.println("Returning Dashboard Stats: " + stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/responders")
    public ResponseEntity<List<User>> getResponders() {
        List<User> responders = userRepository.findAllByRole(Role.ROLE_RESPONDER);
        System.out.println("DEBUG: Found " + responders.size() + " responders in DB");
        return ResponseEntity.ok(responders);
    }

    /**
     * GET /api/admin/dashboard/help-requests
     * Admin views all citizen help requests – enriched with citizen name
     * and emergency type parsed from the description prefix.
     */
    @GetMapping("/help-requests")
    public ResponseEntity<List<HelpRequestAdminView>> getAllHelpRequests() {
        List<HelpRequest> requests = helpRequestRepository.findAll();

        // Sort newest first
        requests.sort((a, b) -> {
            if (b.getCreatedAt() == null)
                return -1;
            if (a.getCreatedAt() == null)
                return 1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        Pattern typePattern = Pattern.compile("^\\[([A-Z]+)]\\s*");

        List<HelpRequestAdminView> views = requests.stream().map(req -> {
            // Look up citizen name
            String citizenName = userRepository.findById(req.getCitizenId())
                    .map(u -> u.getFullName() != null && !u.getFullName().isBlank()
                            ? u.getFullName()
                            : u.getUsername())
                    .orElse("Citizen #" + req.getCitizenId());

            // Parse emergencyType from description prefix e.g. "[FIRE] some text"
            String rawDesc = req.getDescription() != null ? req.getDescription() : "";
            Matcher m = typePattern.matcher(rawDesc);
            String emergencyType = m.find() ? m.group(1) : "OTHER";
            String cleanDesc = rawDesc.replaceFirst("^\\[[A-Z]+]\\s*", "");

            return HelpRequestAdminView.builder()
                    .id(req.getId())
                    .citizenId(req.getCitizenId())
                    .citizenName(citizenName)
                    .emergencyType(emergencyType)
                    .description(cleanDesc)
                    .locationLabel(req.getLocationLabel())
                    .status(req.getStatus().name())
                    .createdAt(req.getCreatedAt())
                    .assignedAt(req.getAssignedAt())
                    .completedAt(req.getCompletedAt())
                    .distanceToResponderKm(req.getDistanceToResponderKm())
                    .assignedResponderId(req.getAssignedResponderId())
                    .build();
        }).collect(Collectors.toList());

        System.out.println("DEBUG: Returning " + views.size() + " help requests to admin");
        return ResponseEntity.ok(views);
    }
}
