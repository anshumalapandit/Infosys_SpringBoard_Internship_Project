package com.disaster.management.repositories;

import com.disaster.management.entities.AlertAcknowledgment;
import com.disaster.management.entities.ReadinessStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertAcknowledgmentRepository extends JpaRepository<AlertAcknowledgment, Long> {

    /** Has a responder already acknowledged a specific disaster alert? */
    Optional<AlertAcknowledgment> findByResponderIdAndDisasterId(Long responderId, Long disasterId);

    /** All acknowledgments for a disaster (for admin audit) */
    List<AlertAcknowledgment> findByDisasterIdOrderByAcknowledgedAtAsc(Long disasterId);

    /** Count ready responders for a disaster */
    long countByDisasterIdAndReadinessStatus(Long disasterId, ReadinessStatus status);

    /** All acknowledgments by a responder (their history) */
    List<AlertAcknowledgment> findByResponderId(Long responderId);

    /**
     * Response efficiency: average seconds between notification sentAt and
     * acknowledgment.
     * Uses native SQL so PostgreSQL EXTRACT(EPOCH FROM ...) syntax works correctly.
     */
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (a.acknowledged_at - n.sent_at))) " +
            "FROM alert_acknowledgments a " +
            "JOIN notifications n ON n.disaster_id = a.disaster_id AND n.user_id = a.responder_id " +
            "WHERE a.disaster_id = :disasterId", nativeQuery = true)
    Double avgResponseTimeSecondsForDisaster(Long disasterId);
}
