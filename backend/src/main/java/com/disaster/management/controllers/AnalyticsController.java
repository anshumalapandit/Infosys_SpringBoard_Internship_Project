package com.disaster.management.controllers;

import com.disaster.management.dto.*;
import com.disaster.management.services.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/disasters")
    public ResponseEntity<List<DisasterMonthlyStatsDTO>> getDisasterStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String disasterType) {
        return ResponseEntity.ok(analyticsService.getDisasterMonthlyStats(start, end, region, disasterType));
    }

    @GetMapping("/regions")
    public ResponseEntity<List<RegionEfficiencyDTO>> getRegionEfficiency(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String disasterType) {
        return ResponseEntity.ok(analyticsService.getRegionEfficiency(start, end, region, disasterType));
    }

    @GetMapping("/responders")
    public ResponseEntity<List<ResponderPerformanceDTO>> getResponderPerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String disasterType) {
        return ResponseEntity.ok(analyticsService.getResponderPerformance(start, end, region, disasterType));
    }

    @GetMapping("/notifications")
    public ResponseEntity<NotificationInsightDTO> getNotificationInsights(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String disasterType) {
        return ResponseEntity.ok(analyticsService.getNotificationInsights(start, end, region, disasterType));
    }

    @GetMapping("/high-risk-areas")
    public ResponseEntity<List<HighRiskAreaDTO>> getHighRiskAreas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String disasterType) {
        return ResponseEntity.ok(analyticsService.getHighRiskAreas(start, end, region, disasterType));
    }
}
