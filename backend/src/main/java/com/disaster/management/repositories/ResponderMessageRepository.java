package com.disaster.management.repositories;

import com.disaster.management.entities.ResponderMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResponderMessageRepository extends JpaRepository<ResponderMessage, Long> {
    List<ResponderMessage> findByResponderIdOrderByCreatedAtDesc(Long responderId);
}
