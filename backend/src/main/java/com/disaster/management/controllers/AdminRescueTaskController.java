package com.disaster.management.controllers;

import com.disaster.management.dto.RescueTaskAssignmentDTO;
import com.disaster.management.dto.RescueTaskDTO;
import com.disaster.management.entities.RescueTask;
import com.disaster.management.entities.RescueTaskStatus;
import com.disaster.management.entities.User;
import com.disaster.management.services.RescueTaskService;
import com.disaster.management.services.MissionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rescue")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRescueTaskController {

    private final RescueTaskService rescueTaskService;
    private final MissionReportService missionReportService;

    @PostMapping("/assign")
    public ResponseEntity<RescueTaskDTO> assignTask(
            @RequestBody RescueTaskAssignmentDTO request,
            org.springframework.security.core.Authentication auth) {

        System.out.println("DEBUG: AdminRescueTaskController.assignTask reached with request: " + request);
        User admin = null;
        if (auth != null && auth.getPrincipal() instanceof User) {
            admin = (User) auth.getPrincipal();
        }

        RescueTask task = rescueTaskService.assignTask(
                request.getDisasterId(),
                request.getResponderId(),
                request.getDescription(),
                request.getHelpRequestId(),
                admin);

        return ResponseEntity.ok(mapToDTO(task));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<RescueTaskDTO>> getAllTasks() {
        return ResponseEntity.ok(rescueTaskService.getAllTasks().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList()));
    }

    private RescueTaskDTO mapToDTO(RescueTask task) {
        RescueTaskDTO.RescueTaskDTOBuilder builder = RescueTaskDTO.builder()
                .taskId(task.getId())
                .disasterId(task.getDisasterEvent() != null ? task.getDisasterEvent().getId() : null)
                .zoneName(task.getDisasterEvent() != null ? task.getDisasterEvent().getLocationName() : "Field Operation")
                .description(task.getDescription())
                .status(task.getStatus())
                .assignedAt(task.getAssignedAt())
                .latitude(task.getLatitude())
                .longitude(task.getLongitude())
                .disasterType(task.getDisasterEvent() != null ? task.getDisasterEvent().getDisasterType().name() : "GENERAL")
                .responderName(task.getResponder().getFullName() != null ? task.getResponder().getFullName()
                        : task.getResponder().getUsername())
                .responderEmail(task.getResponder().getEmail());

        if (task.getStatus() == RescueTaskStatus.COMPLETED) {
            com.disaster.management.entities.MissionReport report = missionReportService.getReportByTaskId(task.getId());
            if (report != null) {
                builder.reportNotes(report.getReportNotes());
                builder.imageUrls(report.getImageUrls());
            }
        }

        return builder.build();
    }
}
