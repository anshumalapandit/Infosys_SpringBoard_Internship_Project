package com.disaster.management.repositories;

import com.disaster.management.entities.HelpRequest;
import com.disaster.management.entities.HelpRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {

    /** All help requests raised by a citizen */
    List<HelpRequest> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    /** All help requests assigned to a responder */
    List<HelpRequest> findByAssignedResponderId(Long responderId);

    /** All pending (unassigned) requests for admin monitoring */
    List<HelpRequest> findByStatus(HelpRequestStatus status);

    /** Count active (non-completed) requests per responder (used to avoid overloading) */
    long countByAssignedResponderIdAndStatusNot(Long responderId, HelpRequestStatus status);
}
