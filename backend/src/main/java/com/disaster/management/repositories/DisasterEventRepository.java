package com.disaster.management.repositories;

import com.disaster.management.entities.DisasterEvent;
import com.disaster.management.entities.DisasterStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface DisasterEventRepository extends JpaRepository<DisasterEvent, Long> {

        Optional<DisasterEvent> findByTitleAndEventTime(String title, LocalDateTime eventTime);

        long countByStatus(DisasterStatus status);

        long countBySeverityAndStatus(com.disaster.management.entities.SeverityLevel severity,
                        DisasterStatus status);
}
