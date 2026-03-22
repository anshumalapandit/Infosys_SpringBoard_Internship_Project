package com.disaster.management.controllers;

import com.disaster.management.entities.MissionReport;
import com.disaster.management.repositories.UserRepository;
import com.disaster.management.services.MissionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responder/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RESPONDER', 'ADMIN')")
public class MissionReportController {

    private final MissionReportService missionReportService;
    private final UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<MissionReport> submitReport(
            @RequestBody Map<String, Object> payload,
            Authentication auth) {
        
        Long responderId = resolveUserId(auth);
        Long taskId = Long.valueOf(payload.get("taskId").toString());
        String notes = payload.get("notes").toString();
        List<String> imageUrls = (List<String>) payload.get("imageUrls");

        return ResponseEntity.ok(missionReportService.submitReport(taskId, responderId, notes, imageUrls));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<MissionReport> getReportByTask(@PathVariable("taskId") Long taskId) {
        return ResponseEntity.ok(missionReportService.getReportByTaskId(taskId));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<MissionReport>> getMyReports(Authentication auth) {
        Long responderId = resolveUserId(auth);
        return ResponseEntity.ok(missionReportService.getReportsByResponder(responderId));
    }

    private Long resolveUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
