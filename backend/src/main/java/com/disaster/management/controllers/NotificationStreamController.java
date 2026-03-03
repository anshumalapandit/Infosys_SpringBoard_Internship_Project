package com.disaster.management.controllers;

import com.disaster.management.repositories.UserRepository;
import com.disaster.management.services.SseNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * NotificationStreamController – provides the authenticated SSE stream
 * endpoint.
 *
 * GET /api/notifications/stream
 *
 * The client (Angular) connects once at login and keeps the connection open.
 * When any broadcast is triggered, the server pushes events here without
 * polling.
 *
 * EventSource (browser API) automatically reconnects on drop.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationStreamController {

    private final SseNotificationService sseNotificationService;
    private final UserRepository userRepository;

    /**
     * Authenticated users subscribe to their personal SSE stream.
     * Produces text/event-stream – the browser EventSource standard.
     */
    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter subscribe(Authentication auth) {
        String username = auth.getName();
        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
        return sseNotificationService.subscribe(userId);
    }
}
