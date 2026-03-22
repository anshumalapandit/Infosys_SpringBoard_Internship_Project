package com.disaster.management.services;

import com.disaster.management.entities.*;
import com.disaster.management.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MissionReportService {

    private final MissionReportRepository missionReportRepository;
    private final RescueTaskRepository rescueTaskRepository;
    private final HelpRequestRepository helpRequestRepository;

    @Transactional
    public MissionReport submitReport(Long taskId, Long responderId, String notes, List<String> imageUrls) {
        System.out.println("DEBUG: MissionReportService.submitReport started for TaskId: " + taskId);
        RescueTask task = rescueTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getResponder().getId().equals(responderId)) {
            throw new RuntimeException("Unauthorized: This task is not assigned to you.");
        }

        MissionReport report = MissionReport.builder()
                .taskId(taskId)
                .responderId(responderId)
                .reportNotes(notes)
                .imageUrls(imageUrls)
                .submittedAt(LocalDateTime.now())
                .build();

        MissionReport savedReport = missionReportRepository.save(report);
        System.out.println("DEBUG: Report saved.");

        // Update task
        task.setReportSubmitted(true);
        task.setStatus(RescueTaskStatus.COMPLETED);
        task.setUpdatedAt(LocalDateTime.now());
        rescueTaskRepository.save(task);
        System.out.println("DEBUG: Task updated to COMPLETED.");

        // side effect: resolve help request if present (tasks for help requests are 1-to-1)
        if (task.getHelpRequestId() != null) {
            helpRequestRepository.findById(task.getHelpRequestId()).ifPresent(hr -> {
                hr.setStatus(HelpRequestStatus.COMPLETED);
                hr.setCompletedAt(LocalDateTime.now());
                helpRequestRepository.save(hr);
            });
        }

        return savedReport;
    }

    public List<MissionReport> getAllReports() {
        return missionReportRepository.findAll();
    }

    public MissionReport getReportByTaskId(Long taskId) {
        return missionReportRepository.findByTaskId(taskId).orElse(null);
    }

    public List<MissionReport> getReportsByResponder(Long responderId) {
        return missionReportRepository.findByResponderId(responderId);
    }
}
