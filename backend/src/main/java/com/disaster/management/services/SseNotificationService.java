package com.disaster.management.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SseNotificationService – manages Server-Sent Event (SSE) connections.
 *
 * Each authenticated user connects once to GET /api/notifications/stream
 * and keeps the connection alive. When an alert is broadcast, the
 * AlertBroadcastService calls {@link #sendToUser(Long, Object)} for each
 * recipient, pushing the payload over their open SSE channel.
 *
 * ConcurrentHashMap ensures thread-safety with no locking overhead for reads.
 */
@Slf4j
@Service
public class SseNotificationService {

    /** userId → active SSE emitter */
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    /** Default timeout: 30 minutes. Client should reconnect automatically. */
    private static final long SSE_TIMEOUT_MS = 30L * 60 * 1000;

    /**
     * Called by the SSE endpoint controller: registers the emitter for this user
     * and attaches lifecycle callbacks to clean up on completion/timeout/error.
     */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitter.onCompletion(() -> {
            emitters.remove(userId);
            log.debug("SSE connection closed for userId={}", userId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(userId);
            log.debug("SSE timeout for userId={}", userId);
        });
        emitter.onError(e -> {
            emitters.remove(userId);
            log.warn("SSE error for userId={}: {}", userId, e.getMessage());
        });

        emitters.put(userId, emitter);
        log.info("SSE subscribed: userId={}", userId);

        // Send an initial "connected" heartbeat so the client knows the stream is live
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Stream established"));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    /**
     * Push a real-time notification payload to a specific user using a custom event
     * name.
     */
    public void sendToUser(Long userId, String eventName, Object payload) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) {
            log.debug("No active SSE for userId={}, skipping push", userId);
            return;
        }
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(payload));
        } catch (IOException e) {
            log.warn("Failed to send SSE to userId={}: {}", userId, e.getMessage());
            emitters.remove(userId);
            emitter.completeWithError(e);
        }
    }

    /**
     * Push a real-time notification payload to a specific user (compatibility with
     * ALERT name).
     */
    public void sendToUser(Long userId, Object payload) {
        sendToUser(userId, "ALERT", payload);
    }

    /**
     * Broadcast the same payload to ALL currently connected users.
     * Useful for system-wide announcements.
     */
    public void broadcast(Object payload) {
        emitters.forEach((userId, emitter) -> sendToUser(userId, payload));
    }

    /**
     * Push a real-time notification payload to a specific list of user IDs in the
     * background.
     * Prevents the calling service from blocking during slow SSE sends.
     */
    @org.springframework.scheduling.annotation.Async
    public void sendToUsersAsync(List<Long> userIds, String eventName, Object payload) {
        log.info("Starting background SSE broadcast [{}] to {} users", eventName, userIds.size());
        userIds.forEach(userId -> sendToUser(userId, eventName, payload));
        log.info("Finished background SSE broadcast.");
    }

    /**
     * Push a real-time notification payload to a specific list of user IDs in the
     * background.
     * Compatibility with ALERT name.
     */
    @org.springframework.scheduling.annotation.Async
    public void sendToUsersAsync(List<Long> userIds, Object payload) {
        sendToUsersAsync(userIds, "ALERT", payload);
    }

    /** Number of currently connected SSE clients (for monitoring). */
    public int activeConnections() {
        return emitters.size();
    }
}
