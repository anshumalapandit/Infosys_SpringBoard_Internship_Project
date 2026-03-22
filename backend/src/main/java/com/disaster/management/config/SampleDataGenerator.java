package com.disaster.management.config;

import com.disaster.management.entities.*;
import com.disaster.management.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SampleDataGenerator implements CommandLineRunner {

    private final DisasterEventRepository disasterRepository;
    private final RescueTaskRepository rescueTaskRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AlertAcknowledgmentRepository acknowledgmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (disasterRepository.count() > 0) {
            log.info("Database already contains data, skipping sample data generation.");
            return;
        }

        log.info("Generating sample data for analytics demo...");

        // Create a Responder if none exists
        User responder = userRepository.findByUsername("responder1")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("responder1");
                    u.setPassword(passwordEncoder.encode("password"));
                    u.setFullName("John Responder");
                    u.setRole(Role.ROLE_RESPONDER);
                    return userRepository.save(u);
                });

        // Create Disasters
        String[] locations = {"Mumbai", "Pune", "Delhi", "Bangalore", "Chennai"};
        DisasterType[] types = {DisasterType.FLOOD, DisasterType.FIRE, DisasterType.EARTHQUAKE, DisasterType.STORM};
        
        for (int i = 0; i < 15; i++) {
            DisasterEvent d = new DisasterEvent();
            d.setTitle("Disaster event " + i);
            d.setDisasterType(types[i % types.length]);
            d.setLocationName(locations[i % locations.length]);
            d.setDescription("Sample disaster incident " + i);
            d.setSeverity(SeverityLevel.values()[i % 3]);
            d.setStatus(i % 3 == 0 ? DisasterStatus.RESOLVED : DisasterStatus.VERIFIED);
            
            // Varying months (last few months)
            LocalDateTime eventTime = LocalDateTime.now().minusMonths(i % 4).minusDays(i % 20);
            d.setEventTime(eventTime);
            d.setCreatedAt(eventTime);
            
            if (d.getStatus() == DisasterStatus.RESOLVED) {
                d.setResolvedAt(eventTime.plusHours(12 + i));
            }
            
            DisasterEvent savedDisaster = disasterRepository.save(d);

            // Create Task for resolved disasters
            if (savedDisaster.getStatus() == DisasterStatus.RESOLVED) {
                RescueTask task = new RescueTask();
                task.setDisasterEvent(savedDisaster);
                task.setResponder(responder);
                task.setStatus(RescueTaskStatus.COMPLETED);
                task.setAssignedAt(eventTime.plusHours(1));
                task.setUpdatedAt(savedDisaster.getResolvedAt());
                rescueTaskRepository.save(task);
            }

            // Create a notification for each disaster
            Notification n = new Notification();
            n.setDisasterId(savedDisaster.getId());
            n.setUserId(responder.getId());
            n.setMessage("Sample alert for " + savedDisaster.getLocationName());
            n.setSentAt(eventTime);
            n.setStatus(NotificationStatus.SENT);
            n.setTargetRegion(savedDisaster.getLocationName());
            n.setRecipientRole("RESPONDER");
            notificationRepository.save(n);

            // Add some acknowledgments for even-indexed notifications
            if (i % 2 == 0) {
                AlertAcknowledgment ack = new AlertAcknowledgment();
                ack.setDisasterId(savedDisaster.getId());
                ack.setResponderId(responder.getId());
                ack.setAcknowledgedAt(eventTime.plusMinutes(30));
                ack.setReadinessStatus(ReadinessStatus.READY);
                ack.setNotes("Ready to assist");
                acknowledgmentRepository.save(ack);
            }
        }

        log.info("Sample data generation completed. Created 15 disasters.");
    }
}
