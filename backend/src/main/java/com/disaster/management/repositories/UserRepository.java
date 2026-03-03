package com.disaster.management.repositories;

import com.disaster.management.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    long countByRole(com.disaster.management.entities.Role role);

    List<User> findAllByRole(com.disaster.management.entities.Role role);

    List<User> findByRegionIgnoreCase(String region);
}
