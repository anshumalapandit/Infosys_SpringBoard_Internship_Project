package com.disaster.management.controllers;

import com.disaster.management.entities.DisasterEvent;
import com.disaster.management.entities.DisasterStatus;
import com.disaster.management.repositories.DisasterEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/disasters")
@RequiredArgsConstructor
public class DisasterEventController {

    private final DisasterEventRepository repository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONDER', 'CITIZEN')")
    public ResponseEntity<List<DisasterEvent>> getAllDisasters() {
        List<DisasterEvent> allEvents = repository.findAll();
        System.out.println("Returning " + allEvents.size() + " total disasters");
        return ResponseEntity.ok(allEvents);
    }

    @GetMapping("/verified")
    @PreAuthorize("hasAnyRole('RESPONDER', 'CITIZEN', 'ADMIN')")
    public ResponseEntity<List<DisasterEvent>> getVerifiedDisasters() {
        return ResponseEntity.ok(repository.findAll().stream()
                .filter(e -> e.getStatus() == DisasterStatus.VERIFIED)
                .collect(Collectors.toList()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DisasterEvent>> getPendingDisasters() {
        return ResponseEntity.ok(repository.findAll().stream()
                .filter(e -> e.getStatus() == DisasterStatus.PENDING)
                .collect(Collectors.toList()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisasterEvent> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") DisasterStatus status) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found"));
        event.setStatus(status);
        return ResponseEntity.ok(repository.save(event));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisasterEvent> updateEvent(
            @PathVariable("id") Long id,
            @RequestBody DisasterEvent eventDetails) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found"));

        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setDisasterType(eventDetails.getDisasterType());
        event.setSeverity(eventDetails.getSeverity());
        event.setLatitude(eventDetails.getLatitude());
        event.setLongitude(eventDetails.getLongitude());
        event.setLocationName(eventDetails.getLocationName());

        return ResponseEntity.ok(repository.save(event));
    }
}
