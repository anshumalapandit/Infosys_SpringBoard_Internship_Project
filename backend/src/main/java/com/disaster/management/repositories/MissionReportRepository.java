package com.disaster.management.repositories;

import com.disaster.management.entities.MissionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface MissionReportRepository extends JpaRepository<MissionReport, Long> {
    Optional<MissionReport> findByTaskId(Long taskId);
    List<MissionReport> findByResponderId(Long responderId);
}
