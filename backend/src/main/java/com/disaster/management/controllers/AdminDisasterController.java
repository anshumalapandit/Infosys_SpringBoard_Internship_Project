package com.disaster.management.controllers;

import com.disaster.management.entities.DisasterEvent;
import com.disaster.management.entities.DisasterStatus;
import com.disaster.management.repositories.DisasterEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/disasters")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDisasterController {

    private final DisasterEventRepository repository;

    // ── Existing endpoints ────────────────────────────────────────────────────

    @GetMapping("/pending")
    public ResponseEntity<List<DisasterEvent>> getPendingDisasters() {
        return ResponseEntity.ok(repository.findAll().stream()
                .filter(e -> e.getStatus() == DisasterStatus.PENDING)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<DisasterEvent> createManualEvent(@RequestBody DisasterEvent event) {
        event.setStatus(DisasterStatus.PENDING);
        event.setCreatedAt(LocalDateTime.now());
        if (event.getEventTime() == null)
            event.setEventTime(LocalDateTime.now());
        event.setSource("Manual Admin Entry");
        return ResponseEntity.ok(repository.save(event));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<DisasterEvent> approveDisaster(@PathVariable("id") Long id) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        event.setStatus(DisasterStatus.VERIFIED);
        return ResponseEntity.ok(repository.save(event));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<DisasterEvent> rejectDisaster(@PathVariable("id") Long id) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        event.setStatus(DisasterStatus.REJECTED);
        return ResponseEntity.ok(repository.save(event));
    }

    @PostMapping("/{id}/broadcast")
    public ResponseEntity<DisasterEvent> broadcastAlert(@PathVariable("id") Long id) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        event.setBroadcastAlertSent(true);
        return ResponseEntity.ok(repository.save(event));
    }

    @PutMapping("/{id}/revoke-broadcast")
    public ResponseEntity<DisasterEvent> revokeBroadcast(@PathVariable("id") Long id) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        event.setBroadcastAlertSent(false);
        return ResponseEntity.ok(repository.save(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDisaster(@PathVariable("id") Long id) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        repository.delete(event);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<DisasterEvent> resolveDisaster(@PathVariable("id") Long id) {
        DisasterEvent event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        event.setStatus(DisasterStatus.RESOLVED);
        event.setResolvedAt(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(event));
    }

    @DeleteMapping("/broadcasted")
    public ResponseEntity<Void> deleteAllBroadcasted() {
        List<DisasterEvent> broadcasted = repository.findAll().stream()
                .filter(DisasterEvent::isBroadcastAlertSent)
                .collect(Collectors.toList());
        repository.deleteAll(broadcasted);
        return ResponseEntity.noContent().build();
    }
}
