package com.disaster.management.repositories;

import com.disaster.management.entities.RescueTask;
import com.disaster.management.entities.RescueTaskStatus;
import com.disaster.management.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueTaskRepository extends JpaRepository<RescueTask, Long> {

    // Find tasks assigned to a specific responder
    List<RescueTask> findByResponder(User responder);

    // Find tasks for a specific disaster event
    List<RescueTask> findByDisasterEvent_Id(Long disasterId);

    // Find tasks by status
    List<RescueTask> findByStatus(RescueTaskStatus status);
}
