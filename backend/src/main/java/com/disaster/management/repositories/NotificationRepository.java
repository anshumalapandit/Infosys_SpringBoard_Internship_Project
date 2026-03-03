package com.disaster.management.repositories;

import com.disaster.management.entities.Notification;
import com.disaster.management.entities.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** All notifications for a specific user (inbox) */
    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);

    /** Unread notifications for a user */
    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);

    /** All notifications created for a specific disaster */
    List<Notification> findByDisasterId(Long disasterId);

    /** Count unread notifications for a user */
    long countByUserIdAndStatus(Long userId, NotificationStatus status);

    /** All notifications for a target region */
    List<Notification> findByTargetRegion(String region);
}
