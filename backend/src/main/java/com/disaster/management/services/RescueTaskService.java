package com.disaster.management.services;

import com.disaster.management.entities.DisasterEvent;
import com.disaster.management.entities.RescueTask;
import com.disaster.management.entities.RescueTaskStatus;
import com.disaster.management.entities.User;
import com.disaster.management.entities.HelpRequestStatus;
import com.disaster.management.repositories.DisasterEventRepository;
import com.disaster.management.repositories.HelpRequestRepository;
import com.disaster.management.repositories.RescueTaskRepository;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RescueTaskService {

    private final RescueTaskRepository rescueTaskRepository;
    private final DisasterEventRepository disasterEventRepository;
    private final UserRepository userRepository;
    private final HelpRequestRepository helpRequestRepository;

    public RescueTask assignTask(Long disasterId, Long responderId, String description, Long helpRequestId, User admin) {
        System.out.println("DEBUG: Assigning task - DisasterId: " + disasterId + ", ResponderId: " + responderId + ", HelpReqId: " + helpRequestId);
        
        DisasterEvent disaster = null;
        if (disasterId != null && disasterId > 0) {
            disaster = disasterEventRepository.findById(disasterId)
                    .orElse(null);
        }

        User responder = userRepository.findById(responderId)
                .orElseThrow(() -> new RuntimeException("Responder not found with ID: " + responderId));

        Double lat = 0.0;
        Double lon = 0.0;

        if (disaster != null) {
            lat = disaster.getLatitude() != null ? disaster.getLatitude() : 0.0;
            lon = disaster.getLongitude() != null ? disaster.getLongitude() : 0.0;
        } else if (helpRequestId != null && helpRequestId > 0) {
            var helpReq = helpRequestRepository.findById(helpRequestId).orElse(null);
            if (helpReq != null) {
                lat = helpReq.getLatitude() != null ? helpReq.getLatitude() : 0.0;
                lon = helpReq.getLongitude() != null ? helpReq.getLongitude() : 0.0;
                System.out.println("DEBUG: Using location from help request: " + lat + ", " + lon);
            }
        }

        try {
            RescueTask task = RescueTask.builder()
                    .disasterEvent(disaster)
                    .responder(responder)
                    .description(description)
                    .latitude(lat)
                    .longitude(lon)
                    .status(RescueTaskStatus.PENDING)
                    .assignedAt(LocalDateTime.now())
                    .assignedBy(admin)
                    .helpRequestId(helpRequestId)
                    .build();

            RescueTask saved = rescueTaskRepository.save(task);
            System.out.println("DEBUG: RescueTask saved successfully with ID: " + saved.getId());

            // If this task originated from a help request, update it
            if (helpRequestId != null && helpRequestId > 0) {
                helpRequestRepository.findById(helpRequestId).ifPresent(hr -> {
                    hr.setStatus(HelpRequestStatus.ASSIGNED);
                    hr.setAssignedResponderId(responderId);
                    hr.setAssignedAt(LocalDateTime.now());
                    helpRequestRepository.save(hr);
                    System.out.println("DEBUG: Updated HelpRequest status to ASSIGNED for ID: " + helpRequestId);
                });
            }

            return saved;
        } catch (Exception e) {
            System.err.println("DEBUG: EXCEPTION in assignTask: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save rescue task: " + e.getMessage());
        }
    }

    public List<RescueTask> getTasksByResponder(User responder) {
        return rescueTaskRepository.findByResponder(responder);
    }

    public RescueTask updateTaskStatus(Long taskId, RescueTaskStatus status) {
        RescueTask task = rescueTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        return rescueTaskRepository.save(task);
    }

    public List<RescueTask> getAllTasks() {
        return rescueTaskRepository.findAll();
    }

    public List<RescueTask> getActiveTasks() {
        return rescueTaskRepository.findAll().stream()
                .filter(t -> t.getStatus() != RescueTaskStatus.COMPLETED)
                .collect(java.util.stream.Collectors.toList());
    }
}
