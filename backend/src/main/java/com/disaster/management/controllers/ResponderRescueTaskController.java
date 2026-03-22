package com.disaster.management.controllers;

import com.disaster.management.dto.RescueTaskDTO;
import com.disaster.management.entities.RescueTask;
import com.disaster.management.entities.RescueTaskStatus;
import com.disaster.management.entities.User;
import com.disaster.management.repositories.UserRepository;
import com.disaster.management.services.RescueTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ResponderRescueTaskController - endpoints for responders to manage their
 * rescue tasks as per user specification.
 */
@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONDER')")
public class ResponderRescueTaskController {

    private final RescueTaskService rescueTaskService;
    private final UserRepository userRepository;
    private final com.disaster.management.services.MissionReportService missionReportService;

    /**
     * GET /api/responder/tasks - Get all rescue tasks for the loggedIn responder.
     */
    @GetMapping("/tasks")
    public ResponseEntity<List<RescueTaskDTO>> getMyTasks(Authentication auth) {
        User responder = resolveUser(auth);
        List<RescueTask> tasks = rescueTaskService.getTasksByResponder(responder);

        List<RescueTaskDTO> dtos = tasks.stream().map(task -> {
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
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * POST /api/responder/tasks/{id}/status - Update task status.
     * Use Start Task → ONGOING, Mark Completed → COMPLETED logic.
     */
    @PostMapping("/tasks/{id}/status")
    public ResponseEntity<RescueTaskDTO> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") RescueTaskStatus status) {
        RescueTask task = rescueTaskService.updateTaskStatus(id, status);

        RescueTaskDTO dto = RescueTaskDTO.builder()
                .taskId(task.getId())
                .zoneName(task.getDisasterEvent() != null ? task.getDisasterEvent().getLocationName() : "Field Operation")
                .description(task.getDescription())
                .status(task.getStatus())
                .assignedAt(task.getAssignedAt())
                .latitude(task.getLatitude())
                .longitude(task.getLongitude())
                .disasterType(task.getDisasterEvent() != null ? task.getDisasterEvent().getDisasterType().name() : "GENERAL")
                .responderName(task.getResponder().getFullName() != null ? task.getResponder().getFullName()
                        : task.getResponder().getUsername())
                .responderEmail(task.getResponder().getEmail())
                .build();

        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/responder/rescue/active-tasks - Get all active rescue tasks.
     */
    @GetMapping("/rescue/active-tasks")
    public ResponseEntity<List<RescueTaskDTO>> getActiveRescueTasks() {
        List<RescueTask> tasks = rescueTaskService.getActiveTasks();

        List<RescueTaskDTO> dtos = tasks.stream().map(task -> RescueTaskDTO.builder()
                .taskId(task.getId())
                .zoneName(task.getDisasterEvent() != null ? task.getDisasterEvent().getLocationName() : "Field Operation")
                .description(task.getDescription())
                .status(task.getStatus())
                .assignedAt(task.getAssignedAt())
                .latitude(task.getLatitude())
                .longitude(task.getLongitude())
                .disasterType(task.getDisasterEvent() != null ? task.getDisasterEvent().getDisasterType().name() : "GENERAL")
                .responderName(task.getResponder().getFullName() != null ? task.getResponder().getFullName()
                        : task.getResponder().getUsername())
                .responderEmail(task.getResponder().getEmail())
                .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private User resolveUser(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
