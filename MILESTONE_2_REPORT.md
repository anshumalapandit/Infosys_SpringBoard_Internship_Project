2nd Milestone Report
Team Details:
Cheepati Janardhan Reddy
Anshumala Pandit
Deepa Mishra

Project Abstract:
Sentinel is an advanced, full-stack digital infrastructure designed to revolutionize how emergency incidents are reported and managed. It serves as a "Command and Control" hub synchronizing citizens, responders, and authorities.

Technical Architecture:
•	Backend: Java Spring Boot (RESTful API, JPA).
•	Frontend: Angular (v17+, Standalone Components).
•	Security: JWT with Role-Based Access Control (RBAC).
•	Database: PostgreSQL.
•	Icons & UI: Lucide Angular, SaaS-inspired CSS architecture.

Milestone 2 Highlights: Successfully developed the comprehensive Admin Command Center, featuring real-time incident monitoring, automated KPI tracking, multi-stage disaster verification workflows, and a centralized alert broadcast system.

PROJECT SUMMARY:
1.	Introduction
Milestone 2 focused on building the "Command and Control" core of the Sentinel system. Following the security foundation established in Milestone 1, this phase operationalized the Admin Dashboard to handle real-world disaster management workflows.
The primary objective of this milestone was to establish:
•	Real-time monitoring of global and local incidents.
•	Automated KPI dashboarding for active threats and responder status.
•	Multi-stage verification lifecycle (Pending → Verified/Rejected → Broadcasted).
•	Advanced filtering systems for rapid disaster analysis.
•	Centralized Responder Directory for resource allocation.
•	Manual Override and Command Actions for emergency authorities.

2.	Admin Command Center Architecture
The dashboard was engineered as a high-performance "Single Pane of Glass" for emergency coordinators.
 KPI Dashboarding
The system automatically aggregates data from across the platform to present 4 critical Key Performance Indicators (KPIs):
•	Active Disasters: Real-time count of verified ongoing threats.
•	Critical Alerts: Count of high-severity incidents requiring immediate attention.
•	Pending Reviews: Quantity of incoming citizen reports awaiting verification.
•	Active Responders: Number of personnel currently deployed in the field.

 Live Incident Monitoring & Management
The core of the dashboard is the Live Incident Grid, which supports:
•	Multi-tier Filtering: Admins can filter by Severity (Critical, High, Medium, Low), Status (Pending, Verified, Resolved, Rejected), and Location.
•	Real-time Search: Instant lookup for specific disaster types or locations.
•	Dynamic Visual Cues: Color-coded severity badges and disaster-type dots (Fire: Red, Flood: Blue, etc.) for rapid recognition.

3.	Incident Verification Workflow
To prevent misinformation and ensure resource efficiency, every reported incident follows a strict verification pipeline.
🔹 Step 1: Verification Queue
Incoming reports are initialized in a `PENDING` state. Admins review descriptions, locations, and source data.
🔹 Step 2: Approve or Reject
•	Approve: Moves the incident to `VERIFIED` status, making it eligible for broadcast.
•	Reject: Marks the report as false or resolved, removing it from the active queue with a confirmation safety check to prevent accidental deletions.
🔹 Step 3: Broadcast Control
Once verified, an incident can be "Broadcasted". This triggers the digital alert system to notify citizens and responders in the affected region.

 Command Actions & Manual Reporting
In scenarios where automated data is unavailable, admins can use "Command Actions":
•	Manual Event Entry: A robust modal allowing admins to report new disasters, including support for "Other" custom disaster types.
•	Quick Broadcast: One-click alerting for the most recent verified threat.
•	Verification Queue Shortcuts: Instant access to filtered views of high-priority pending items.

4.	Responder Management System
A dedicated view for tracking response units. It displays:
•	Full Name & Badge Number: For official identification.
•	Responder Type: Fire, Medical, Police, or specialized units.
•	Geographic Region: The designated area of operation.
•	Contact Connectivity: Quick access to phone/email for coordination.

 Development Tools we used:
Category	Tools Used
Backend	Spring Boot, JPA, PostgreSQL
Frontend	Angular 17, Lucide Icons
Logic	Reactive Extensions (RxJS), RESTful Services
Style	Vanilla CSS (SaaS-styled architecture)
Environment	VS Code, Postman

5.	Source Code:
AdminDashboardController.java (Backend Stats & Responder Management):
```java
package com.disaster.management.controllers;

import com.disaster.management.dto.DashboardStatsDTO;
import com.disaster.management.entities.DisasterStatus;
import com.disaster.management.entities.Role;
import com.disaster.management.entities.SeverityLevel;
import com.disaster.management.repositories.DisasterEventRepository;
import com.disaster.management.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.disaster.management.entities.User;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final DisasterEventRepository disasterRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .activeDisasters(disasterRepository.countByStatus(DisasterStatus.VERIFIED))
                .criticalAlerts(
                        disasterRepository.countBySeverityAndStatus(SeverityLevel.CRITICAL, DisasterStatus.VERIFIED))
                .pendingReviews(disasterRepository.countByStatus(DisasterStatus.PENDING))
                .activeResponders(userRepository.countByRole(Role.ROLE_RESPONDER))
                .build();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/responders")
    public ResponseEntity<List<User>> getResponders() {
        return ResponseEntity.ok(userRepository.findAllByRole(Role.ROLE_RESPONDER));
    }
}
```

AdminDisasterController.java (Incident Workflow Management):
```java
@PutMapping("/{id}/approve")
public ResponseEntity<DisasterEvent> approveDisaster(@PathVariable Long id) {
    DisasterEvent event = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Disaster not found"));
    event.setStatus(DisasterStatus.VERIFIED);
    return ResponseEntity.ok(repository.save(event));
}

@PutMapping("/{id}/reject")
public ResponseEntity<DisasterEvent> rejectDisaster(@PathVariable Long id) {
    DisasterEvent event = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Disaster not found"));
    event.setStatus(DisasterStatus.REJECTED);
    return ResponseEntity.ok(repository.save(event));
}

@PostMapping("/{id}/broadcast")
public ResponseEntity<DisasterEvent> broadcastAlert(@PathVariable Long id) {
    DisasterEvent event = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Disaster not found"));
    event.setBroadcastAlertSent(true);
    return ResponseEntity.ok(repository.save(event));
}
```

DisasterService (Frontend - API Orchestration):
```typescript
@Injectable({ providedIn: 'root' })
export class DisasterService {
    private adminUrl = 'http://localhost:8080/api/admin';

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.adminUrl}/dashboard/stats`);
    }

    approveDisaster(id: number): Observable<DisasterEvent> {
        return this.http.put<DisasterEvent>(`${this.adminUrl}/disasters/${id}/approve`, {});
    }

    broadcastAlert(id: number): Observable<DisasterEvent> {
        return this.http.post<DisasterEvent>(`${this.adminUrl}/disasters/${id}/broadcast`, {});
    }
}
```

6.	Screenshots of Dashboard Features:
(The dashboard features a dark-themed sidebar, glassmorphic KPI cards with pulse animations for critical alerts, a high-density data grid for incident monitoring, and interactive modals for manual command actions.)

7.	Conclusion:
Milestone 2 successfully transformed Sentinel from a secure framework into a functional Command and Control system. By centralizing incident monitoring, verification, and alerting, the platform now provides emergency admins with the tools needed for rapid response and decisive action. The integration of real-time KPIs and structured disaster lifecycles ensures that Sentinel is ready to serve as the backbone of modern disaster management.
