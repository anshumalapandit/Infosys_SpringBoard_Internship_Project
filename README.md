# 🛡️ Sentinel — Disaster Management & Alert System
### Infosys SpringBoard Internship Project

> A full-stack, real-time disaster management platform built for Infosys SpringBoard Internship. Sentinel enables administrators, responders, and citizens to collaboratively manage disaster events through live dashboards, broadcast alerts, and citizen help requests — all secured with JWT-based authentication.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [User Roles](#user-roles)
5. [Milestones](#milestones)
   - [Milestone 1 — Core Authentication & Role System](#milestone-1--core-authentication--role-system)
   - [Milestone 2 — Admin Dashboard & Disaster Management](#milestone-2--admin-dashboard--disaster-management)
   - [Milestone 3 — Alert Broadcasting & SSE Real-Time Notifications](#milestone-3--alert-broadcasting--sse-real-time-notifications)
   - [Milestone 4 — Rescue Operations Module ✅](#milestone-4--rescue-operations-module-)
   - [Milestone 5 — Analytics & Reporting ✅](#milestone-5--analytics--reporting)
6. [Project Structure](#project-structure)
7. [Setup & Running Locally](#setup--running-locally)
8. [API Endpoints](#api-endpoints)
9. [Database Schema Overview](#database-schema-overview)
10. [Screenshots / Features](#screenshots--features)


---

## 📌 Project Overview

**Sentinel** is a Disaster Management System designed to:
- **Detect** and **monitor** disaster events in real-time
- Allow **admins** to verify, approve, broadcast, resolve, or reject disaster events
- Push **live alerts** to responders and citizens using Server-Sent Events (SSE)
- Allow **responders** to acknowledge alerts and confirm their readiness
- Allow **citizens** to submit emergency help requests during disasters
- Provide a unified, role-based dashboard experience for all three user types

---

## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 17** | Core programming language |
| **Spring Boot 3.2.2** | Application framework |
| **Spring Security** | Authentication & Authorization |
| **Spring Data JPA** | ORM / Database access |
| **PostgreSQL** | Primary relational database |
| **JWT (jjwt 0.11.5)** | Stateless token-based authentication |
| **SSE (Server-Sent Events)** | Real-time push notifications |
| **Lombok** | Boilerplate reduction |
| **Springdoc / Swagger UI** | API documentation (`/swagger-ui.html`) |
| **Maven** | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| **Angular 17+** (Standalone) | SPA framework |
| **TypeScript** | Typed component logic |
| **Lucide Angular** | Icon library |
| **CSS (custom)** | Styling with CSS variables & Inter font |
| **RxJS** | Reactive programming / observables |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Angular Frontend                   │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Admin   │  │  Responder   │  │    Citizen     │  │
│  │Dashboard │  │  Dashboard   │  │   Dashboard    │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬────────┘  │
│       │               │                  │            │
│       └───────────────┼──────────────────┘            │
│                  HTTP + SSE (EventSource)              │
└──────────────────────────────┬───────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────┐
│               Spring Boot REST API (:8080)            │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  │
│  │  Auth   │  │  Admin   │  │Citizen │  │Responder│  │
│  │Controller│ │Controller│  │Control │  │Control  │  │
│  └────┬────┘  └────┬─────┘  └───┬────┘  └────┬────┘  │
│       │            │            │             │        │
│  ┌────▼────────────▼────────────▼─────────────▼─────┐ │
│  │        Services + Repositories (JPA)             │ │
│  └────────────────────────┬─────────────────────────┘ │
└───────────────────────────┼───────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │        PostgreSQL DB        │
              │  sentinel_db (port 5432)    │
              └────────────────────────────┘
```

---

## 👤 User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full dashboard access — manage disasters, broadcast alerts, view responders & help requests |
| `RESPONDER` | View incoming alerts via SSE, acknowledge/confirm receipt, see citizen help requests |
| `CITIZEN` | Submit emergency help requests, receive notifications about nearby disasters |

---

## 🚀 Milestones

---

### Milestone 1 — Core Authentication & Role System

**Goal:** Establish a secure, stateless authentication system with Role-Based Access Control (RBAC).

#### ✅ What was built:
- **User Registration** (`POST /api/auth/register`) with role assignment (`ADMIN`, `RESPONDER`, `CITIZEN`)
- **User Login** (`POST /api/auth/login`) returning a signed **JWT token**
- **JWT Authentication Filter** — validates `Authorization: Bearer <token>` on every protected request
- **Spring Security Configuration** — whitelists public routes (`/api/auth/**`) and protects all others
- **`User` Entity** with fields: `id`, `username`, `email`, `password` (BCrypt), `role`, `fullName`, `phone`, `badgeNumber`, `responderType`, `region`
- **`Role` Enum**: `ADMIN`, `RESPONDER`, `CITIZEN`

#### 📂 Key Files:
```
backend/src/main/java/com/disaster/management/
├── auth/
│   ├── AuthenticationController.java   ← Register & Login endpoints
│   ├── AuthenticationService.java      ← Business logic, JWT generation
│   ├── AuthenticationRequest.java
│   ├── AuthenticationResponse.java     ← Returns JWT token
│   └── RegisterRequest.java
├── security/
│   ├── JwtService.java                 ← Token signing, validation, extraction
│   └── JwtAuthenticationFilter.java    ← Per-request JWT filter
├── config/
│   ├── SecurityConfiguration.java      ← Security rules, password encoder
│   └── ApplicationConfig.java          ← UserDetailsService, Auth provider
└── entities/
    ├── User.java
    └── Role.java
```

#### 🔐 Security Flow:
```
Client → POST /api/auth/login (username + password)
      ← JWT Token (24h expiry)

Client → GET /api/admin/... (Authorization: Bearer <token>)
       → JwtAuthenticationFilter validates token
       → Grants access if role matches
```

---

### Milestone 2 — Admin Dashboard & Disaster Management

**Goal:** Build a full-featured Admin Dashboard to monitor, verify, approve, and manage disaster events.

#### ✅ What was built:
- **Admin Dashboard UI** — Sidebar navigation with role-based views (Monitoring, Alert Management, Responders, Help Requests)
- **KPI Cards** — Live stats: Active Disasters, Critical Alerts, Pending Reviews, Active Responders
- **Live Incidents Table** — Shows all disaster events with Type, Severity, Location, Status, Reported Time
- **Filtering** — Filter by Severity, Status, and Location
- **Approve Incident** (`PUT /api/admin/disasters/{id}/approve`) — changes status to `VERIFIED`
- **Reject Incident** (`PUT /api/admin/disasters/{id}/reject`) — with confirmation modal
- **Resolve Incident** (`PUT /api/admin/disasters/{id}/resolve`) — marks disaster as `RESOLVED`
- **Delete Incident** (`DELETE /api/admin/disasters/{id}`)
- **Manual Event Creation** — Admin can manually report new disasters from a modal form
- **Dashboard Stats API** (`GET /api/admin/dashboard/stats`) — returns aggregated KPI data

#### 📂 Key Files:
```
backend/src/main/java/com/disaster/management/
├── controllers/
│   ├── AdminDashboardController.java   ← Stats API
│   └── AdminDisasterController.java    ← Approve, reject, resolve, delete
├── entities/
│   ├── DisasterEvent.java              ← Main event entity
│   ├── DisasterType.java               ← Enum: FIRE, FLOOD, EARTHQUAKE, etc.
│   ├── DisasterStatus.java             ← Enum: PENDING, VERIFIED, RESOLVED, REJECTED
│   └── SeverityLevel.java              ← Enum: LOW, MEDIUM, HIGH, CRITICAL
├── dto/
│   └── DashboardStatsDTO.java

frontend/src/app/features/admin/
└── dashboard/dashboard.component.ts    ← Full Admin Dashboard (inline template + styles)
```

#### 🎨 UI Features:
- Fixed sidebar with logo, nav menu, user profile, and logout
- Responsive KPI grid (4 cards)
- Table with color-coded severity badges and status chips
- Dropdown 3-dot action menu per row (Approve, Broadcast, Revoke, View, Reject, Resolve, Delete)
- Broadcast indicator badge when alert has been sent

---

### Milestone 3 — Alert Broadcasting & SSE Real-Time Notifications

**Goal:** Enable admins to broadcast verified disaster alerts, with real-time delivery to recipients via Server-Sent Events.

#### ✅ What was built:
- **Broadcast Alert** (`POST /api/admin/alerts/broadcast/{disasterId}`) — sends notifications to all citizens (optionally filtered by region)
- **Revoke Broadcast** — admin can revoke a sent broadcast
- **Alert History** — tab to view all previously broadcasted alerts
- **Pending Alert Queue** — verified disasters waiting to be broadcasted
- **SSE Notification Stream** (`GET /api/notifications/stream`) — persists long-lived HTTP connections per user
- **SSE Notification Service** — `ConcurrentHashMap<userId, SseEmitter>` for thread-safe, real-time delivery
- **Notification Entity** — stores each notification with status (`SENT`, `READ`, `FAILED`)
- **Async broadcast** — `sendToUsersAsync()` prevents calling thread from blocking during SSE pushes

#### 📂 Key Files:
```
backend/src/main/java/com/disaster/management/
├── controllers/
│   ├── AdminAlertController.java           ← Broadcast, revoke endpoints
│   └── NotificationStreamController.java  ← GET /api/notifications/stream (SSE)
├── services/
│   ├── AlertBroadcastService.java          ← Core broadcast logic
│   └── SseNotificationService.java        ← SSE emitter management
├── entities/
│   ├── Notification.java                  ← Notification record
│   └── NotificationStatus.java            ← SENT, READ, FAILED
├── dto/
│   ├── BroadcastAlertRequest.java
│   └── BroadcastAlertResponse.java        ← notificationsSent, targetRegion
└── repositories/
    └── NotificationRepository.java
```

#### 🔄 SSE Flow:
```
Frontend opens EventSource → GET /api/notifications/stream?userId=X
Backend registers SseEmitter (30 min timeout)

Admin broadcasts alert →
AlertBroadcastService → loops all recipient userIds →
SseNotificationService.sendToUsersAsync() →
EventSource receives "ALERT" event in real-time
```

---

### Milestone 4 — Rescue Operations Module ✅

**Goal:** Establish a robust Rescue Operations system for managing and tracking emergency responses.

#### ✅ What was built:
- **Rescue Task Management** — Admins can create and assign rescue tasks to responders.
- **Responder Workflow** — Responders can view assigned tasks and update their status (`ACCEPTED`, `EN_ROUTE`, `ON_SITE`, `COMPLETED`).
- **Mission Reports** — Responders can submit detailed reports upon completion of a task.
- **Real-time Tracking** — Admins can monitor the status of all active rescue operations.
- **`RescueTask` Entity** — records assignments, statuses, and links to disasters.
- **`MissionReport` Entity** — stores outcomes, casualties, and resources used.

#### 📂 Key Files:
```
backend/src/main/java/com/disaster/management/
├── controllers/
│   ├── AdminRescueTaskController.java
│   ├── ResponderRescueTaskController.java
│   └── MissionReportController.java
├── services/
│   ├── RescueTaskService.java
│   └── MissionReportService.java
├── entities/
│   ├── RescueTask.java
│   ├── RescueTaskStatus.java
│   └── MissionReport.java
```

---

### Milestone 5 — Analytics & Reporting ✅

**Goal:** Generate data-driven insights to evaluate system performance and disaster response efficiency.

#### ✅ What was built:
- **Disaster Analytics Dashboard**:
  - Live visualization of disaster trends categorized by type and month.
  - Regional resolution efficiency tracking to compare performance across different areas.
- **High-Risk Area Identification**:
  - Implemented `GET /api/admin/analytics/high-risk-areas` to identify top 5 danger zones based on historical disaster frequency and severity.
- **Notification Insights**:
  - Real-time tracking of user engagement levels for broadcasted alerts.
  - Calculated metrics for alerts Acknowledged vs. Ignored.
- **Responder Performance Metrics**:
  - Aggregated task completion rates and average response time calculations.
  - Activity monitoring to ensure resource optimization.
- **Discovery & Awareness Suite**:
  - **High-Fidelity Mission Page**: A dedicated page outlining Sentinel's 6 core goals (Real-Time Connectivity, Zero-Delay Alerts, etc.).
  - **Safety Awareness Hub**: Practical, high-contrast educational cards for citizens during "Safe" periods.

#### 📂 Key Files:
```
backend/src/main/java/com/disaster/management/
├── controllers/
│   └── AnalyticsController.java           ← Analytics & High-Risk endpoints
├── dto/
│   ├── DisasterAnalyticsDTO.java          ← Aggregation DTOs
│   ├── ResponderPerformanceDTO.java
│   └── HighRiskAreaDTO.java
└── services/
    └── AnalyticsService.java              ← Complex aggregation & grouping logic

frontend/src/app/features/
├── mission/mission.component.ts           ← New Mission Page
└── admin/analytics/                       ← Analytics Dashboard UI
```

---

## 📁 Project Structure

```
Infosys_Internship/
├── backend/                        ← Spring Boot Application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/disaster/management/
│       │   ├── ManagementApplication.java
│       │   ├── auth/               ← JWT auth (login, register)
│       │   ├── config/             ← Spring Security config
│       │   ├── controllers/        ← REST API controllers
│       │   ├── dto/                ← Data Transfer Objects
│       │   ├── entities/           ← JPA entities & enums
│       │   ├── exceptions/         ← Global exception handler
│       │   ├── profile/            ← Profile management
│       │   ├── repositories/       ← Spring Data JPA repos
│       │   ├── security/           ← JWT filter & service
│       │   └── services/           ← Business logic layer
│       └── resources/
│           └── application.properties
│
├── frontend/                       ← Angular Application
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css
│       └── app/
│           ├── app.routes.ts
│           ├── core/
│           │   ├── guards/         ← Route guards (Auth, Role)
│           │   ├── interceptors/   ← HTTP JWT interceptor
│           │   └── services/       ← AuthService, DisasterService
│           ├── features/
│           │   ├── admin/          ← Admin Dashboard
│           │   ├── auth/           ← Login & Register pages
│           │   ├── contact/        ← Contact page
│           │   ├── landing/        ← Landing/Home page
│           │   ├── responder/      ← Responder Dashboard
│           │   └── user/           ← Citizen Dashboard
│           ├── models/             ← TypeScript interfaces
│           └── shared/             ← Shared components (Unauthorized page)
│
└── .gitignore
```

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm
- PostgreSQL 14+
- Angular CLI (`npm install -g @angular/cli`)

### 1. Database Setup
```sql
CREATE DATABASE sentinel_db;
```

### 2. Backend Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sentinel_db
spring.datasource.username=<your_postgres_username>
spring.datasource.password=<your_postgres_password>
application.security.jwt.secret-key=<your_secret_key>
```

### 3. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```
> Backend starts at: **http://localhost:8080**
> Swagger UI available at: **http://localhost:8080/swagger-ui.html**

### 4. Run the Frontend
```bash
cd frontend
npm install
ng serve
```
> Frontend starts at: **http://localhost:4200**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Admin — Disasters
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/disasters` | Get all disaster events |
| PUT | `/api/admin/disasters/{id}/approve` | Approve/Verify a disaster |
| PUT | `/api/admin/disasters/{id}/reject` | Reject a disaster |
| PUT | `/api/admin/disasters/{id}/resolve` | Resolve a disaster |
| DELETE | `/api/admin/disasters/{id}` | Delete a disaster |
| GET | `/api/admin/dashboard/stats` | Get KPI statistics |

### Admin — Alerts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/alerts/broadcast/{disasterId}` | Broadcast alert to citizens |
| POST | `/api/admin/alerts/revoke/{disasterId}` | Revoke a broadcast |

### Notifications (SSE)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/stream` | Open SSE stream for real-time alerts |

### Responders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/responders` | List all responders |
| POST | `/api/responder/alerts/{alertId}/acknowledge` | Acknowledge an alert |

### Citizens
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/citizen/help-request` | Submit a help request |
| GET | `/api/citizen/help-requests` | Get help requests (Admin view) |

---

## 🗃️ Database Schema Overview

```
users
 ├── id (PK)
 ├── username, email, password (BCrypt)
 ├── role (ADMIN | RESPONDER | CITIZEN)
 ├── full_name, phone, badge_number
 ├── responder_type, region
 └── created_at

disaster_events
 ├── id (PK)
 ├── title, location_name
 ├── disaster_type (FIRE | FLOOD | EARTHQUAKE | ...)
 ├── severity (LOW | MEDIUM | HIGH | CRITICAL)
 ├── status (PENDING | VERIFIED | RESOLVED | REJECTED)
 ├── broadcast_alert_sent (boolean)
 └── event_time

notifications
 ├── id (PK)
 ├── user_id (FK → users)
 ├── disaster_event_id (FK → disaster_events)
 ├── message, status (SENT | READ | FAILED)
 └── created_at

alert_acknowledgments
 ├── id (PK)
 ├── responder_id (FK → users)
 ├── alert_id (FK → notifications)
 ├── readiness_status (READY | UNAVAILABLE | EN_ROUTE)
 └── acknowledged_at

help_requests
 ├── id (PK)
 ├── citizen_id (FK → users)
 ├── emergency_type (FIRE | FLOOD | MEDICAL | CRIME | OTHER)
 ├── description, location_label
 ├── status (PENDING | ASSIGNED | COMPLETED)
 ├── assigned_responder_id (FK → users, nullable)
 ├── distance_to_responder_km
 └── created_at
```

---

## 🌟 Screenshots / Features

| Feature | Description |
|---|---|
| 🔐 Login / Register | Clean animated form with role-based registration |
| 📊 Admin KPI Dashboard | 4 live KPI cards showing active disasters, alerts, reviews, responders |
| 🗂️ Live Incidents Table | Filterable table with severity badges and action dropdowns |
| 📡 Broadcast Modal | Broadcast alerts with custom message and region targeting |
| 🔔 SSE Real-Time Alerts | Push notifications delivered instantly to open dashboards |
| ✅ Responder Interaction | Multi-stage task acknowledgement and real-time status updates |
| ✅ Citizen Emergency Port | Unified dashboard for incident reporting and help request tracking |
| ✅ Mission & Vision Hub | High-fidelity page outlining the platform's 6 technical goals |
| ✅ Analytics Engine | Data-driven dashboards for high-risk areas and response metrics |

---


## 👩‍💻 Author

**Anshumala Pandit**
Infosys SpringBoard Internship — Disaster Management System Project

---

> ⭐ If you found this project helpful, consider starring the repository!
