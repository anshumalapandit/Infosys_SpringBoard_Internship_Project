package com.disaster.management.repositories;

import com.disaster.management.entities.Incident;
import com.disaster.management.entities.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // Find incidents reported by a specific citizen
    List<Incident> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    // Find incidents assigned to a specific responder
    List<Incident> findByResponderIdOrderByUpdatedAtDesc(Long responderId);

    // Find all incidents of a certain status (e.g., PENDING for Admin to assign)
    List<Incident> findByStatus(IncidentStatus status);

    // Find by type (e.g., all FIRE reports)
    List<Incident> findByType(String type);
}
