import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DisasterService, DisasterEvent, DashboardStats, BroadcastResult } from '../../../core/services/disaster.service';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Shield,
  LayoutDashboard,
  Siren,
  Users,
  Settings,
  Activity,
  TriangleAlert,
  CircleCheck,
  Radio,
  Plus,
  Send,
  MoreVertical,
  LogOut,
  Search,
  ShieldCheck,
  Bell,
  BellRing,
  History,
  AlertTriangle,
  Megaphone,
  X,
  Check,
  Eye,
  RotateCcw,
  XCircle,
  Trash2
} from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="monitor-panel">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <div class="logo-box">
            <lucide-icon name="shield" class="brand-icon"></lucide-icon>
          </div>
          <span class="brand-name">Sentinel</span>
        </div>

        <nav class="nav-menu">
          <div class="nav-section">MANAGEMENT</div>
          <ul class="nav-list">
            <li class="nav-item" [class.active]="currentView === 'MONITORING'" (click)="setView('MONITORING')">
              <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
              <span>Monitoring</span>
            </li>
            <li class="nav-item">
              <lucide-icon name="siren" [size]="18"></lucide-icon>
              <span>Disasters</span>
            </li>
            <li class="nav-item" [class.active]="currentView === 'ALERTS'" (click)="setView('ALERTS')">
              <lucide-icon name="radio" [size]="18"></lucide-icon>
              <span>Alert Management</span>
            </li>
            <li class="nav-item" [class.active]="currentView === 'RESPONDERS'" (click)="setView('RESPONDERS')">
              <lucide-icon name="shield-check" [size]="18"></lucide-icon>
              <span>View Responders</span>
            </li>
            <li class="nav-item" [class.active]="currentView === 'HELP_REQUESTS'" (click)="setView('HELP_REQUESTS')">
              <lucide-icon name="triangle-alert" [size]="18"></lucide-icon>
              <span>Help Requests
                <span class="nav-badge" *ngIf="newHelpRequestCount > 0">{{ newHelpRequestCount }}</span>
              </span>
            </li>
          </ul>

          <div class="nav-section">SYSTEM</div>
          <ul class="nav-list">
            <li class="nav-item">
              <lucide-icon name="users" [size]="18"></lucide-icon>
              <span>Units & Staff</span>
            </li>
            <li class="nav-item">
              <lucide-icon name="settings" [size]="18"></lucide-icon>
              <span>Configuration</span>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile" *ngIf="currentUser">
            <div class="user-avatar">
              {{ (currentUser.fullName || currentUser.username || 'A')[0].toUpperCase() }}
            </div>
            <div class="user-details">
              <p class="user-name">{{ currentUser?.fullName || currentUser?.username || 'Admin' }}</p>
              <p class="user-role">{{ formatRole(currentUser?.role) || 'Administrator' }}</p>
            </div>
          </div>
          <button type="button" class="logout-btn" (click)="logout()">
            <lucide-icon name="log-out" [size]="18"></lucide-icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="content-header">
          <div class="header-title">
            <h1>Admin Dashboard</h1>
          </div>
        </header>

        <!-- KPI Section -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon danger"><lucide-icon name="activity"></lucide-icon></div>
            <div class="kpi-info">
              <span class="label">Active Disasters</span>
              <h2 class="value">{{ stats.activeDisasters }}</h2>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon warning"><lucide-icon name="triangle-alert"></lucide-icon></div>
            <div class="kpi-info">
              <span class="label">Critical Alerts</span>
              <h2 class="value">{{ stats.criticalAlerts }}</h2>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon info"><lucide-icon name="circle-check"></lucide-icon></div>
            <div class="kpi-info">
              <span class="label">Pending Reviews</span>
              <h2 class="value">{{ stats.pendingReviews }}</h2>
            </div>
          </div>

          <div class="kpi-card success">
            <div class="kpi-icon success"><lucide-icon name="users"></lucide-icon></div>
            <div class="kpi-info">
              <span class="label">Active Responders</span>
              <h2 class="value">{{ stats.activeResponders }}</h2>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Incident Table (Monitoring View) -->
          <section class="table-panel" *ngIf="currentView === 'MONITORING'">
            <div class="panel-header">
              <div class="title-with-icon">
                <lucide-icon name="siren" [size]="18"></lucide-icon>
                <h2>Live Incidents</h2>
              </div>
              <div class="header-filters">
                <select [(ngModel)]="selectedSeverity" (change)="filterData()" class="filter-select">
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select [(ngModel)]="selectedStatus" (change)="filterData()" class="filter-select">
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select [(ngModel)]="selectedLocation" (change)="filterData()" class="filter-select">
                  <option value="ALL">All Locations</option>
                  <option *ngFor="let loc of uniqueLocations" [value]="loc">{{ loc }}</option>
                </select>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Reported Time</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let disaster of filteredDisasters; trackBy: trackById">
                    <td>
                      <div class="type-cell">
                        <div class="type-dot" [ngClass]="disaster.disasterType.toLowerCase()"></div>
                        {{ disaster.disasterType }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="disaster.severity.toLowerCase()">
                        {{ disaster.severity }}
                      </span>
                    </td>
                    <td>{{ disaster.locationName }}</td>
                    <td>
                      <div class="status-cell">
                        <span class="status" [ngClass]="disaster.status.toLowerCase()">
                          {{ disaster.status }}
                        </span>
                        <div class="broadcast-badge" *ngIf="disaster.broadcastAlertSent" title="Alert Broadcasted">
                          <lucide-icon name="megaphone" [size]="12"></lucide-icon>
                        </div>
                      </div>
                    </td>
                    <td>{{ disaster.eventTime | date:'short' }}</td>
                    <td class="text-right">
                      <div class="action-hierarchy" *ngIf="disaster.id">
                        <!-- Primary Action: Approve Button -->
                        <button type="button" 
                          class="btn-primary-action" 
                          [ngClass]="disaster.status === 'VERIFIED' ? 'status-approved' : 'status-pending'"
                          [disabled]="disaster.status === 'VERIFIED'"
                          (click)="approveEvent(disaster.id!)">
                          <lucide-icon *ngIf="disaster.status === 'VERIFIED'" name="check" [size]="14"></lucide-icon>
                          <span>{{ disaster.status === 'VERIFIED' ? 'Approved' : 'Approve' }}</span>
                        </button>

                        <!-- Secondary Actions: 3-Dot Menu -->
                        <div class="dropdown-wrapper">
                          <button type="button" class="btn-icon-more" (click)="toggleMenu($event, disaster.id!)">
                            <lucide-icon name="more-vertical" [size]="16"></lucide-icon>
                          </button>
                          
                          <div class="action-dropdown" *ngIf="activeMenuId === disaster.id">
                            <!-- Broadcast Option (Only for Verified) -->
                            <button type="button" class="dropdown-item" *ngIf="disaster.status === 'VERIFIED' && !disaster.broadcastAlertSent" (click)="broadcast(disaster.id!)">
                              <lucide-icon name="send" [size]="14"></lucide-icon>
                              <span>Broadcast Alert</span>
                            </button>
                            
                            <!-- Revoke Option (If already broadcasted) -->
                            <button type="button" class="dropdown-item warning" *ngIf="disaster.broadcastAlertSent" (click)="revokeBroadcast(disaster.id!)">
                              <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
                              <span>Revoke Broadcast</span>
                            </button>

                            <!-- Common Actions -->
                            <button type="button" class="dropdown-item" (click)="viewDetails(disaster)">
                              <lucide-icon name="eye" [size]="14"></lucide-icon>
                              <span>View Details</span>
                            </button>
                            
                             <!-- Reject Option (For both Pending and Verified) -->
                             <button type="button" class="dropdown-item danger" *ngIf="disaster.status !== 'REJECTED' && disaster.status !== 'RESOLVED'" (click)="confirmReject(disaster.id!)">
                               <lucide-icon name="x-circle" [size]="14"></lucide-icon>
                               <span>Reject Incident</span>
                             </button>

                             <!-- Resolve Option (Only for Verified) -->
                             <button type="button" class="dropdown-item success" *ngIf="disaster.status === 'VERIFIED'" (click)="resolveEvent(disaster.id!)" style="color: #059669;">
                               <lucide-icon name="circle-check" [size]="14"></lucide-icon>
                               <span>Resolve Incident</span>
                             </button>

                             <!-- Delete Option -->
                             <button type="button" class="dropdown-item danger" (click)="deleteEvent(disaster.id!)" style="color: #dc2626;">
                               <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                               <span>Delete Permanently</span>
                             </button>
                           </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Alert Management View -->
          <section class="table-panel" *ngIf="currentView === 'ALERTS'">
            <div class="panel-header">
              <div class="title-with-icon">
                <lucide-icon name="megaphone" [size]="18" style="color: #2563eb;"></lucide-icon>
                <h2>Pending Broadcast Alerts</h2>
              </div>
              <div class="header-filters" style="gap: 16px;">
                <button type="button" class="tab-btn" *ngIf="alertTab === 'HISTORY' && sentAlerts.length > 0" 
                        (click)="clearHistory()" 
                        style="color: #dc2626; border: 1px solid #fee2e2; background: #fff5f5; display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px;">
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  Clear History
                </button>
                <div class="btn-group">
                   <button type="button" class="tab-btn" [class.active]="alertTab === 'QUEUE'" (click)="alertTab = 'QUEUE'">Pending Queue</button>
                   <button type="button" class="tab-btn" [class.active]="alertTab === 'HISTORY'" (click)="alertTab = 'HISTORY'">Alert History</button>
                </div>
              </div>
            </div>

            <div class="alert-view-container" *ngIf="alertTab === 'QUEUE'">
              <div class="queue-item" *ngFor="let item of pendingAlerts; trackBy: trackById">
                <div class="queue-info">
                  <div class="queue-type-icon" [ngClass]="item.severity.toLowerCase()">
                    <lucide-icon name="triangle-alert"></lucide-icon>
                  </div>
                  <div class="queue-text">
                    <strong>{{ item.title || item.disasterType || 'Untitled Disaster' }}</strong>
                    <span>{{ item.locationName || 'Unknown Region' }} • Level: {{ item.severity }}</span>
                  </div>
                </div>
                <div class="queue-actions">
                  <button type="button" class="send-btn" (click)="broadcast(item.id!)">
                    <lucide-icon name="send" [size]="16"></lucide-icon>
                    Broadcast Now
                  </button>
                </div>
              </div>
              <div class="empty-state" *ngIf="pendingAlerts.length === 0">
                 <lucide-icon name="bell" [size]="40"></lucide-icon>
                 <p>No verified disasters waiting for broadcast.</p>
              </div>
            </div>

            <div class="table-container" *ngIf="alertTab === 'HISTORY'">
              <table>
                <thead>
                  <tr>
                    <th>Alert Target</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Sent At</th>
                    <th class="text-right">Status</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let alert of sentAlerts; trackBy: trackById">
                    <td>
                      <strong>{{ alert.title }}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-dim);">{{ alert.locationName }}</div>
                    </td>
                    <td>{{ alert.disasterType }}</td>
                    <td>
                      <span class="badge" [ngClass]="alert.severity.toLowerCase()">{{ alert.severity }}</span>
                    </td>
                    <td>{{ alert.eventTime | date:'medium' }}</td>
                    <td class="text-right">
                      <span class="status verified" *ngIf="alert.status !== 'RESOLVED'">BROADCASTED</span>
                      <span class="status resolved" *ngIf="alert.status === 'RESOLVED'" style="background: #d1fae5; color: #059669; border-color: #a7f3d0;">RESOLVED</span>
                    </td>
                    <td class="text-right">
                      <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button type="button" class="btn-icon-more" *ngIf="alert.status !== 'RESOLVED'" 
                                style="color: #059669; border-color: #d1fae5; background: #f0fdf4;" 
                                title="Resolve Alert" (click)="resolveEvent(alert.id!)">
                          <lucide-icon name="circle-check" [size]="14"></lucide-icon>
                        </button>
                        <button type="button" class="btn-icon-more" 
                                style="color: #dc2626; border-color: #fee2e2; background: #fff5f5;" 
                                title="Delete Alert" (click)="deleteEvent(alert.id!)">
                          <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Citizen Help Requests View -->
          <section class="table-panel" *ngIf="currentView === 'HELP_REQUESTS'">
            <div class="panel-header">
              <div class="title-with-icon">
                <lucide-icon name="triangle-alert" [size]="18" style="color: #dc2626;"></lucide-icon>
                <h2>Citizen Help Requests</h2>
                <span class="live-badge" *ngIf="helpRequests.length > 0">{{ helpRequests.length }} total</span>
              </div>
              <div class="header-filters">
                <button type="button" class="tab-btn" (click)="loadHelpRequests()" style="display:flex;align-items:center;gap:6px;">
                  <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon> Refresh
                </button>
              </div>
            </div>

            <!-- Error state -->
            <div *ngIf="helpRequestsError" style="padding:20px 24px; background:#fff5f5; border-bottom:1px solid #fee2e2; color:#dc2626; font-size:0.875rem; font-weight:600;">
              ⚠️ {{ helpRequestsError }}
            </div>

            <div class="help-request-list" *ngIf="helpRequests.length > 0">
              <div class="help-req-card"
                   *ngFor="let req of helpRequests; trackBy: trackById"
                   [class.pending]="req.status === 'PENDING'"
                   [class.assigned]="req.status === 'ASSIGNED'"
                   [class.completed]="req.status === 'COMPLETED'">

                <div class="help-req-left">
                  <div class="help-type-icon" [class.fire]="req.emergencyType === 'FIRE' || req.emergencyType?.includes('FIRE')"
                                              [class.flood]="req.emergencyType === 'FLOOD'"
                                              [class.medical]="req.emergencyType === 'MEDICAL'"
                                              [class.crime]="req.emergencyType === 'CRIME'">
                    <lucide-icon name="triangle-alert" [size]="18"></lucide-icon>
                  </div>
                  <div class="help-req-info">
                    <div class="help-req-citizen">
                      <strong>{{ req.citizenName || 'Citizen #' + req.citizenId }}</strong>
                      <span class="help-type-chip" [class.fire]="req.emergencyType === 'FIRE'"
                            [class.flood]="req.emergencyType === 'FLOOD'"
                            [class.medical]="req.emergencyType === 'MEDICAL'"
                            [class.crime]="req.emergencyType === 'CRIME'">
                        {{ req.emergencyType || 'OTHER' }}
                      </span>
                    </div>
                    <p class="help-req-desc">{{ req.description }}</p>
                    <div class="help-req-meta">
                      <span>📍 {{ req.locationLabel || 'Unknown Location' }}</span>
                      <span>🕐 {{ req.createdAt | date:'short' }}</span>
                      <span *ngIf="req.assignedResponderId">👤 Responder assigned</span>
                    </div>
                  </div>
                </div>

                <div class="help-req-right">
                  <span class="help-status-badge" [class.pending]="req.status === 'PENDING'"
                        [class.assigned]="req.status === 'ASSIGNED'"
                        [class.completed]="req.status === 'COMPLETED'">
                    {{ req.status }}
                  </span>
                  <span *ngIf="req.distanceToResponderKm" class="distance-chip">
                    {{ req.distanceToResponderKm | number:'1.1-1' }} km
                  </span>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="helpRequests.length === 0 && !helpRequestsError">
              <lucide-icon name="triangle-alert" [size]="40"></lucide-icon>
              <p>No citizen help requests yet.</p>
              <p style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Requests will appear here when citizens submit emergency reports from their dashboard.</p>
            </div>
          </section>

          <!-- Responders View -->
          <section class="table-panel" *ngIf="currentView === 'RESPONDERS'">
            <div class="panel-header">
              <div class="title-with-icon">
                <lucide-icon name="shield-check" [size]="18"></lucide-icon>
                <h2>Active Responders</h2>
              </div>
              <div class="header-filters">
                <div class="search-bar">
                  <lucide-icon name="search" [size]="16"></lucide-icon>
                  <input type="text" placeholder="Search responders..." [(ngModel)]="responderSearchTerm" (input)="filterResponders()">
                </div>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Responder Name</th>
                    <th>Type</th>
                    <th>Badge #</th>
                    <th>Region</th>
                    <th>Contact</th>
                    <th class="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let responder of filteredResponders; trackBy: trackById">
                    <td>
                      <div class="type-cell">
                        <div class="user-avatar-sm">
                          {{ (responder.fullName || responder.username || 'R')[0].toUpperCase() }}
                        </div>
                        <div class="user-info-cell">
                          <strong>{{ responder.fullName || responder.username }}</strong>
                          <span>@{{ responder.username }}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge info">{{ responder.responderType || 'UNIT' }}</span></td>
                    <td><code>{{ responder.badgeNumber || 'N/A' }}</code></td>
                    <td>{{ responder.region || 'CENTRAL' }}</td>
                    <td>{{ responder.phone || responder.email }}</td>
                    <td class="text-right">
                      <span class="status verified">ACTIVE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Side Actions panel -->
          <aside class="actions-panel">
            <div class="panel-header" style="border:none; padding-bottom: 0;">
              <h2>Command Actions</h2>
            </div>
            <div class="action-list">
              <button type="button" class="action-item" (click)="quickBroadcast()">
                <lucide-icon name="send" [size]="18"></lucide-icon>
                <div class="text">
                  <strong>Broadcast Alert</strong>
                  <p>Notify for latest event</p>
                </div>
              </button>
              <button type="button" class="action-item" (click)="openManualEventModal()">
                <lucide-icon name="plus" [size]="18"></lucide-icon>
                <div class="text">
                  <strong>Manual Event</strong>
                  <p>Report new disaster</p>
                </div>
              </button>
              <button type="button" class="action-item" (click)="setView('MONITORING'); filterPending()">
                <lucide-icon name="shield" [size]="18"></lucide-icon>
                <div class="text">
                  <strong>Verification Queue</strong>
                  <p>Review {{ stats.pendingReviews }} pending</p>
                </div>
              </button>
              <button type="button" class="action-item emergency" (click)="setView('ALERTS')">
                <lucide-icon name="megaphone" [size]="18"></lucide-icon>
                <div class="text">
                  <strong>Emergency Alert</strong>
                  <p>Open Alert Centre</p>
                </div>
              </button>
            </div>
          </aside>
        </div>
      </main>

      <!-- ============ BROADCAST MODAL ============ -->
      <div class="modal-overlay" *ngIf="showBroadcastModal" (click)="closeBroadcastModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-icon" style="background:#eff6ff; color:#2563eb;">
              <lucide-icon name="send" [size]="24"></lucide-icon>
            </div>
            <h2>Broadcast Alert</h2>
            <button type="button" class="close-btn" (click)="closeBroadcastModal()">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>

          <!-- Success Result -->
          <div *ngIf="broadcastResult" style="padding:24px; background:#eff6ff; border-bottom:1px solid #dbeafe;">
            <div style="display:flex; align-items:center; gap:12px; color:#1d4ed8;">
              <lucide-icon name="check" [size]="20"></lucide-icon>
              <div>
                <strong style="font-size:1rem;">Alert Broadcasted Successfully!</strong>
                <p style="margin:4px 0 0; font-size:0.875rem;">
                  {{ broadcastResult.notificationsSent }} citizen(s) in
                  <em>{{ broadcastResult.targetRegion || 'ALL regions' }}</em> notified.
                </p>
              </div>
            </div>
          </div>

          <div class="modal-body" *ngIf="!broadcastResult">
            <div style="background:#fef9c3; border:1px solid #fde68a; border-radius:10px; padding:14px 16px; margin-bottom:20px; font-size:0.875rem; color:#92400e;">
              ⚠️ This will notify all citizens in the selected region. Disaster must be <strong>VERIFIED</strong>.
            </div>

            <div class="input-group">
              <label>Disaster</label>
              <input type="text" class="form-input" [value]="broadcastTarget?.title || 'ID: ' + broadcastTarget?.id" readonly style="background:#f8fafc; color:#64748b;">
            </div>

            <div class="input-group">
              <label>Target Region <span style="color:#64748b; font-weight:400;">(leave blank to notify ALL users)</span></label>
              <input type="text" id="broadcastRegion" class="form-input" [(ngModel)]="broadcastRegion" placeholder="e.g. North District, Downtown...">
            </div>

            <div class="input-group">
              <label>Custom Message <span style="color:#64748b; font-weight:400;">(optional – auto-generated if blank)</span></label>
              <textarea class="form-input" [(ngModel)]="broadcastMessage" rows="3" placeholder="Enter a custom alert message..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="closeBroadcastModal()">{{ broadcastResult ? 'Close' : 'Cancel' }}</button>
            <button type="button" class="btn-submit" (click)="sendBroadcast()" [disabled]="broadcasting || !!broadcastResult"
                    style="background:#2563eb; display:flex; align-items:center; gap:8px;">
              <lucide-icon name="send" [size]="15"></lucide-icon>
              {{ broadcasting ? 'Sending...' : 'Send Broadcast' }}
            </button>
          </div>
        </div>
      </div>
      <!-- ======================================== -->

      <!-- Manual Event Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-icon">
              <lucide-icon name="triangle-alert" [size]="24"></lucide-icon>
            </div>
            <h2>Create Disaster Alert</h2>
            <button type="button" class="close-btn" (click)="closeModal()">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label for="disasterTitle">Title</label>
              <input type="text" id="disasterTitle" placeholder="Enter disaster title..." [(ngModel)]="manualEvent.title" class="form-input">
            </div>
            <div class="input-group">
              <label for="disasterLocation">Location</label>
              <input type="text" id="disasterLocation" placeholder="Enter location name..." [(ngModel)]="manualEvent.locationName" class="form-input">
            </div>
            <div class="input-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="input-group">
                <label for="disasterType">Type</label>
                <select id="disasterType" [(ngModel)]="manualEvent.disasterType" class="form-select">
                  <option value="FIRE">Fire</option>
                  <option value="FLOOD">Flood</option>
                  <option value="EARTHQUAKE">Earthquake</option>
                  <option value="STORM">Storm</option>
                  <option value="CYCLONE">Cyclone</option>
                  <option value="TSUNAMI">Tsunami</option>
                  <option value="LANDSLIDE">Landslide</option>
                  <option value="WILDFIRE">Wildfire</option>
                  <option value="TORNADO">Tornado</option>
                  <option value="HEATWAVE">Heatwave</option>
                  <option value="BLIZZARD">Blizzard</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="input-group">
                <label for="disasterSeverity">Severity</label>
                <select id="disasterSeverity" [(ngModel)]="manualEvent.severity" class="form-select">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            
            <!-- Conditional Other Type Input -->
            <div class="input-group" *ngIf="manualEvent.disasterType === 'OTHER'" style="margin-top: 16px;">
              <label for="otherType">Specify Other Disaster Type</label>
              <input type="text" id="otherType" placeholder="e.g. Chemical Leak, Pandemic..." [(ngModel)]="otherTypeSpecification" class="form-input">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button type="button" class="btn-submit" (click)="submitManualEvent()" [disabled]="!manualEvent.title || !manualEvent.locationName">Create Alert</button>
          </div>
        </div>
      </div>

      <!-- ======================================== -->

      <!-- Confirmation Modal for Reject -->
      <div class="modal-overlay confirmation" *ngIf="showRejectModal" (click)="cancelConfirm()">
        <div class="modal-card mini" (click)="$event.stopPropagation()">
          <div class="modal-body text-center" style="padding: 40px 32px;">
            <div class="confirm-icon danger" style="width: 64px; height: 64px; background: #fef2f2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <lucide-icon name="x-circle" [size]="32"></lucide-icon>
            </div>
            <h3 style="margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 700;">
              Reject Incident?
            </h3>
            <p style="color: #64748b; line-height: 1.5; margin-bottom: 24px;">
              This action will mark the incident as rejected and remove it from the active queue.
              This cannot be undone.
            </p>
            <div class="confirm-actions" style="display: flex; gap: 12px; justify-content: center;">
              <button type="button" class="btn-cancel" (click)="cancelConfirm()">Cancel</button>
              <button type="button" class="btn-submit" (click)="confirmRejectAction()" style="background: #dc2626;">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      --primary-red: #dc2626;
      --primary-red-hover: #b91c1c;
      --primary-green: #10b981;
      --bg-panel: #f8fafc;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-dim: #64748b;
      font-family: 'Inter', sans-serif;
    }

    lucide-icon, span { pointer-events: none; }
    button * { pointer-events: none; }
    button { pointer-events: auto !important; }

    .monitor-panel { display: flex; min-height: 100vh; background: var(--bg-panel); color: var(--text-main); }

    /* Sidebar */
    .sidebar { width: 260px; background: #ffffff; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px; position: fixed; height: 100vh; z-index: 100; }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; }
    .logo-box { background: var(--primary-red); padding: 6px; border-radius: 8px; color: white; display: flex; }
    .brand-name { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
    .nav-section { font-size: 0.75rem; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em; margin: 24px 0 12px 0; }
    .nav-list { list-style: none; padding: 0; margin: 0; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: var(--text-dim); cursor: pointer; margin-bottom: 4px; font-weight: 500; transition: all 0.2s; }
    .nav-item.active { background: var(--primary-red); color: white; }
    .sidebar-footer { margin-top: auto; padding-top: 24px; border-top: 1px solid var(--border); }
    .user-profile { display: flex; align-items: center; gap: 12px; padding: 12px 0; margin-bottom: 16px; }
    .user-avatar { width: 40px; height: 40px; background: #334155; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .logout-btn { width: 100%; padding: 10px; background: white; border: 1px solid var(--border); border-radius: 10px; color: var(--primary-red); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: 600; }

    /* Main Content */
    .main-content { margin-left: 260px; flex: 1; padding: 32px 40px; display: flex; flex-direction: column; gap: 32px; width: calc(100% - 260px); }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .kpi-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); display: flex; align-items: center; gap: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { padding: 12px; border-radius: 12px; display: flex; }
    .kpi-icon.danger { background: #fee2e2; color: #dc2626; }
    .kpi-icon.warning { background: #fffbeb; color: #d97706; }
    .kpi-icon.info { background: #eff6ff; color: #2563eb; }
    .kpi-icon.success { background: #d1fae5; color: #059669; }

    /* Layout Grid */
    .dashboard-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
    .table-panel { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .panel-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 20px; }
    .title-with-icon { display: flex; align-items: center; gap: 12px; font-weight: 700; flex-shrink: 0; }
    .header-filters { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem; color: var(--text-main); background: white; outline: none; }

    /* Table */
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 800px; }
    th { padding: 16px 24px; background: #f8fafc; font-size: 0.75rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; border-bottom: 1px solid var(--border); text-align: left; }
    td { padding: 16px 24px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }

    /* Action Redesign */
    .action-hierarchy { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
    .btn-primary-action {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; 
      font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; 
      transition: all 0.2s ease-in-out; white-space: nowrap;
      user-select: none;
    }
    .btn-primary-action.status-pending { 
      background: #f1f5f9; 
      color: #334155; 
      border-color: #e2e8f0; 
    }
    .btn-primary-action.status-pending:hover { 
      background: white;
      color: var(--primary-red);
      border-color: var(--primary-red);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
      transform: translateY(-1px);
    }
    .btn-primary-action.status-pending:active {
      transform: translateY(0) scale(0.97);
    }
    .btn-primary-action.status-approved { 
      background: #ecfdf5; 
      color: #059669; 
      border-color: #d1fae5; 
      cursor: default; 
      opacity: 0.9;
    }

    .btn-icon-more { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border); background: white; color: var(--text-dim); cursor: pointer; }
    .dropdown-wrapper { position: relative; }
    .action-dropdown { 
      position: absolute; top: 100%; right: 0; margin-top: 8px; width: 180px; background: white; 
      border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
      z-index: 200; padding: 6px; 
    }
    .dropdown-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; font-size: 0.85rem; font-weight: 500; color: var(--text-main); background: transparent; border: none; border-radius: 8px; cursor: pointer; text-align: left; }
    .dropdown-item:hover { background: #f1f5f9; }
    .dropdown-item.danger { color: #dc2626; }
    .dropdown-item.warning { color: #d97706; }

    /* Type Indicators */
    .type-cell { display: flex; align-items: center; gap: 10px; font-weight: 500; }
    .type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    
    .type-dot.fire { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
    .type-dot.flood { background: #3b82f6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }
    .type-dot.earthquake { background: #8b5cf6; box-shadow: 0 0 8px rgba(139, 92, 246, 0.4); }
    .type-dot.storm { background: #64748b; box-shadow: 0 0 8px rgba(100, 116, 139, 0.4); }
    .type-dot.cyclone { background: #06b6d4; box-shadow: 0 0 8px rgba(6, 182, 212, 0.4); }
    .type-dot.tsunami { background: #0ea5e9; box-shadow: 0 0 8px rgba(14, 165, 233, 0.4); }
    .type-dot.landslide { background: #78350f; box-shadow: 0 0 8px rgba(120, 53, 15, 0.4); }
    .type-dot.wildfire { background: #f97316; box-shadow: 0 0 8px rgba(249, 115, 22, 0.4); }
    .type-dot.tornado { background: #475569; box-shadow: 0 0 8px rgba(71, 85, 105, 0.4); }
    .type-dot.heatwave { background: #ea580c; box-shadow: 0 0 8px rgba(234, 88, 12, 0.4); }
    .type-dot.blizzard { background: #94a3b8; box-shadow: 0 0 8px rgba(148, 163, 184, 0.4); }
    .type-dot.other { background: #d1d5db; }


    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-card { background: white; width: 100%; max-width: 500px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
    .modal-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; position: relative; }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 24px; background: #f8fafc; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
    .btn-cancel { padding: 10px 20px; border: 1.5px solid var(--border); border-radius: 10px; background: white; cursor: pointer; font-weight: 600; color: var(--text-dim); }
    .btn-submit { padding: 10px 24px; background: var(--primary-red); border: none; border-radius: 10px; color: white; cursor: pointer; font-weight: 700; }
    .form-input, .form-select { width: 100%; padding: 12px; border: 1.5px solid var(--border); border-radius: 8px; margin-bottom: 16px; outline: none; }

    /* Badges */
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
    .badge.critical { background: #fee2e2; color: #b91c1c; }
    .badge.high { background: #fff7ed; color: #c2410c; }
    .badge.medium { background: #eff6ff; color: #1d4ed8; }
    .badge.low { background: #f0fdf4; color: #15803d; }
    
    .status { font-weight: 700; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .status.pending { background: #fffbeb; color: #92400e; }
    .status.verified { background: #ecfdf5; color: #065f46; }

    .status-cell { display: flex; align-items: center; gap: 8px; }
    .broadcast-badge { 
      background: #eff6ff; color: #2563eb; padding: 4px; border-radius: 6px; 
      display: flex; animation: pulse-blue 2s infinite; 
    }
    @keyframes pulse-blue {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }

    .action-list { display: flex; flex-direction: column; gap: 12px; padding: 20px; }
    .action-item { 
      width: 100%; display: flex; align-items: center; gap: 16px; padding: 16px; 
      background: white; border: 1px solid var(--border); border-radius: 12px; 
      cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
    }
    .action-item:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-2px); }
    .action-item lucide-icon { color: var(--text-dim); flex-shrink: 0; }
    .action-item .text { display: flex; flex-direction: column; gap: 2px; }
    .action-item strong { font-size: 0.95rem; color: var(--text-main); font-weight: 700; }
    .action-item p { font-size: 0.8rem; color: var(--text-dim); margin: 0; }
    .action-item.emergency { background: #eff6ff; border-color: #dbeafe; }
    .action-item.emergency lucide-icon { color: #2563eb; }
    .action-item.emergency lucide-icon { color: #2563eb; }

    /* Alert Management & Broadcasting Styles */
    .alert-view-container { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .queue-item { 
      display: flex; justify-content: space-between; align-items: center; padding: 20px; 
      border: 1px solid var(--border); border-radius: 12px; background: white; 
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .queue-item:hover { transform: translateX(4px); border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .queue-info { display: flex; align-items: center; gap: 20px; }
    .queue-type-icon { 
      padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      background: #f1f5f9; color: #64748b;
    }
    .queue-type-icon.critical { background: #fee2e2; color: #dc2626; }
    .queue-type-icon.high { background: #fff7ed; color: #c2410c; }
    .queue-type-icon.medium { background: #eff6ff; color: #1d4ed8; }
    .queue-type-icon.low { background: #f0fdf4; color: #15803d; }
    
    /* Type-specific colors for queue icons regardless of severity if needed, 
       but currently it uses severity. Let's add specific ones for variety if we want, 
       or just stick to severity for the icon box and use the title for type. 
       Actually, the existing code uses item.severity.toLowerCase(). 
       Let's keep that but maybe add a hint. */

    
    .queue-text { display: flex; flex-direction: column; gap: 4px; }
    .queue-text strong { font-size: 1rem; color: var(--text-main); font-weight: 700; }
    .queue-text span { font-size: 0.85rem; color: var(--text-dim); }
    
    .send-btn { 
      display: flex; align-items: center; gap: 8px; padding: 10px 18px; 
      background: #2563eb; color: white; border: none; border-radius: 10px; 
      font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .send-btn:hover { background: #1d4ed8; transform: scale(1.02); }
    .send-btn:active { transform: scale(0.98); }

    .tab-btn { 
      padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; 
      background: transparent; color: var(--text-dim); font-size: 0.85rem; 
      font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: white; border-color: var(--border); color: var(--text-main); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .btn-group { background: #f1f5f9; padding: 4px; border-radius: 10px; display: flex; gap: 2px; }

    .live-badge { background: #dc2626; color: white; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 20px; margin-left: 8px; animation: pulse-live 2s infinite; }
    @keyframes pulse-live { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

    /* Help Request Cards */
    .help-request-list { display: flex; flex-direction: column; gap: 0; }
    .help-req-card { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid var(--border); transition: background 0.2s; border-left: 4px solid transparent; }
    .help-req-card:hover { background: #f8fafc; }
    .help-req-card.pending { border-left-color: #dc2626; }
    .help-req-card.assigned { border-left-color: #d97706; }
    .help-req-card.completed { border-left-color: #10b981; opacity: 0.75; }
    .help-req-left { display: flex; align-items: flex-start; gap: 16px; flex: 1; }
    .help-req-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
    .help-type-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #f1f5f9; color: #64748b; }
    .help-type-icon.fire { background: #fee2e2; color: #dc2626; }
    .help-type-icon.flood { background: #dbeafe; color: #2563eb; }
    .help-type-icon.medical { background: #d1fae5; color: #059669; }
    .help-type-icon.crime { background: #fef3c7; color: #d97706; }
    .help-req-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .help-req-citizen { display: flex; align-items: center; gap: 10px; }
    .help-req-citizen strong { font-size: 0.95rem; color: var(--text-main); font-weight: 700; }
    .help-type-chip { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; background: #f1f5f9; color: #64748b; }
    .help-type-chip.fire { background: #fee2e2; color: #dc2626; }
    .help-type-chip.flood { background: #dbeafe; color: #2563eb; }
    .help-type-chip.medical { background: #d1fae5; color: #059669; }
    .help-type-chip.crime { background: #fef3c7; color: #d97706; }
    .help-req-desc { font-size: 0.875rem; color: var(--text-dim); margin: 0; line-height: 1.5; max-width: 600px; }
    .help-req-meta { display: flex; gap: 16px; font-size: 0.75rem; color: #94a3b8; flex-wrap: wrap; }
    .help-status-badge { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
    .help-status-badge.pending { background: #fee2e2; color: #dc2626; }
    .help-status-badge.assigned { background: #fffbeb; color: #d97706; }
    .help-status-badge.completed { background: #d1fae5; color: #059669; }
    .distance-chip { font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 3px 10px; border-radius: 20px; font-weight: 600; }

    .nav-badge { background: #dc2626; color: white; font-size: 0.6rem; font-weight: 800; padding: 1px 5px; border-radius: 10px; margin-left: 4px; vertical-align: middle; }

    .empty-state { 
      display: flex; flex-direction: column; align-items: center; justify-content: center; 
      padding: 80px 40px; color: var(--text-dim); text-align: center; 
    }
    .empty-state lucide-icon { margin-bottom: 20px; color: #e2e8f0; }
    .empty-state p { font-size: 0.95rem; font-weight: 500; }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  currentTime: string = '';
  private clockInterval: any;

  stats: DashboardStats = {
    activeDisasters: 0,
    criticalAlerts: 0,
    pendingReviews: 0,
    activeResponders: 0
  };

  allDisasters: DisasterEvent[] = [];
  filteredDisasters: DisasterEvent[] = [];
  searchTerm: string = '';
  selectedSeverity: string = 'ALL';
  selectedStatus: string = 'ALL';
  selectedLocation: string = 'ALL';
  uniqueLocations: string[] = [];

  currentView: 'MONITORING' | 'RESPONDERS' | 'ALERTS' | 'HELP_REQUESTS' = 'MONITORING';
  alertTab: 'QUEUE' | 'HISTORY' = 'QUEUE';

  // Help Requests
  helpRequests: any[] = [];
  newHelpRequestCount = 0;
  helpRequestsError = '';

  // SSE State
  private eventSource: EventSource | null = null;
  sseStatus: 'CONNECTING' | 'CONNECTED' | 'ERROR' = 'CONNECTING';

  responders: any[] = [];
  filteredResponders: any[] = [];
  responderSearchTerm: string = '';

  activeMenuId: number | null = null;
  showRejectModal: boolean = false;
  targetId: number | null = null;
  showModal: boolean = false;

  // ---- Broadcast Modal state ----
  showBroadcastModal = false;
  broadcastTarget: DisasterEvent | null = null;
  broadcastRegion = '';
  broadcastMessage = '';
  broadcasting = false;
  broadcastResult: BroadcastResult | null = null;
  otherTypeSpecification: string = '';

  manualEvent: Partial<DisasterEvent> = {
    title: '',
    locationName: '',
    disasterType: 'FIRE',
    severity: 'HIGH'
  };

  constructor(
    private authService: AuthService,
    private disasterService: DisasterService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.loadData();
    this.loadResponders();
    this.setupSseConnection();
    setInterval(() => {
      this.loadData();
      this.loadResponders();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.closeSse();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.activeMenuId !== null) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-wrapper')) {
        this.activeMenuId = null;
      }
    }
  }

  toggleMenu(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour12: false });
  }

  loadData() {
    this.disasterService.getDashboardStats().subscribe(stats => this.stats = stats);
    this.disasterService.getAllDisasters().subscribe(events => {
      this.allDisasters = events || [];
      this.extractUniqueLocations();
      this.filterData();
    });
    this.loadHelpRequests();
  }

  loadHelpRequests() {
    this.helpRequestsError = '';
    this.disasterService.getAdminHelpRequests().subscribe({
      next: (reqs) => {
        this.helpRequests = reqs || [];
        console.log('Help requests loaded:', this.helpRequests.length);
      },
      error: (err) => {
        this.helpRequestsError = 'Failed to load help requests: ' + (err?.error?.message || err?.status || 'Server error');
        console.error('Help requests fetch error:', err);
      }
    });
  }

  loadResponders() {
    this.disasterService.getResponders().subscribe(data => {
      this.responders = data || [];
      this.filterResponders();
    });
  }

  get pendingAlerts(): DisasterEvent[] {
    return this.allDisasters.filter(d => d.status === 'VERIFIED' && !d.broadcastAlertSent);
  }

  get sentAlerts(): DisasterEvent[] {
    return this.allDisasters.filter(d => d.broadcastAlertSent);
  }

  setView(view: 'MONITORING' | 'RESPONDERS' | 'ALERTS' | 'HELP_REQUESTS') {
    this.currentView = view;
    if (view === 'HELP_REQUESTS') {
      this.newHelpRequestCount = 0;
      this.loadHelpRequests();
    }
  }

  filterResponders() {
    const search = this.responderSearchTerm.toLowerCase();
    this.filteredResponders = this.responders.filter(r => {
      return (r.fullName?.toLowerCase().includes(search) || false) ||
        (r.username?.toLowerCase().includes(search) || false);
    });
  }

  formatRole(role: string): string {
    if (!role) return '';
    return role.replace('ROLE_', '').toLowerCase().replace(/^./, str => str.toUpperCase());
  }

  private extractUniqueLocations() {
    const locations = this.allDisasters.map(d => d.locationName);
    this.uniqueLocations = Array.from(new Set(locations.filter(l => l))).sort();
  }

  filterData() {
    this.filteredDisasters = this.allDisasters.filter(d => {
      const search = this.searchTerm.toLowerCase();
      const matchSearch =
        (d.locationName?.toLowerCase().includes(search) || false) ||
        (d.disasterType?.toLowerCase().includes(search) || false) ||
        (d.title?.toLowerCase().includes(search) || false);

      const matchSeverity = this.selectedSeverity === 'ALL' || d.severity === this.selectedSeverity;
      const matchStatus = this.selectedStatus === 'ALL' || d.status === this.selectedStatus;
      const matchLoc = this.selectedLocation === 'ALL' || d.locationName === this.selectedLocation;
      const matchBroadcast = !d.broadcastAlertSent;

      return matchSearch && matchSeverity && matchStatus && matchLoc && matchBroadcast;
    }).sort((a, b) => {
      const timeA = a.eventTime ? new Date(a.eventTime).getTime() : 0;
      const timeB = b.eventTime ? new Date(b.eventTime).getTime() : 0;
      return timeB - timeA;
    });
  }

  approveEvent(id: number) {
    const disaster = this.allDisasters.find(d => d.id === id);
    if (!disaster) return;

    // Optimistic Update: turn it into green "Approved" state instantly
    const originalStatus = disaster.status;
    const originalStats = { ...this.stats };

    disaster.status = 'VERIFIED';
    if (originalStatus === 'PENDING') {
      this.stats.pendingReviews--;
      this.stats.activeDisasters++;
      if (disaster.severity === 'CRITICAL') this.stats.criticalAlerts++;
    }
    this.filterData();

    this.disasterService.approveDisaster(id).subscribe({
      next: (res) => {
        console.log('Approve success:', res);
        this.loadData();
      },
      error: (err) => {
        console.error('Approve failed:', err);
        disaster.status = originalStatus;
        this.stats = originalStats;
        this.filterData();
        alert('Could not approve. Please check server connection.');
      }
    });
  }

  resolveEvent(id: number) {
    const disaster = this.allDisasters.find(d => d.id === id);
    if (!disaster) return;

    // Optimistic Update: turn it into RESOLVED instantly
    const originalStatus = disaster.status;
    const originalStats = { ...this.stats };

    disaster.status = 'RESOLVED';
    if (originalStatus === 'VERIFIED') {
      this.stats.activeDisasters--;
      if (disaster.severity === 'CRITICAL') this.stats.criticalAlerts--;
    }
    this.filterData();

    this.disasterService.resolveDisaster(id).subscribe({
      next: (res) => {
        console.log('Resolve success:', res);
        this.loadData();
      },
      error: (err) => {
        console.error('Resolve failed:', err);
        disaster.status = originalStatus;
        this.stats = originalStats;
        this.filterData();
        alert('Could not resolve incident. Please try again.');
      }
    });
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this alert record?')) {
      const disaster = this.allDisasters.find(d => d.id === id);
      const originalAll = [...this.allDisasters];
      const originalStats = { ...this.stats };

      if (disaster) {
        if (disaster.status === 'PENDING') this.stats.pendingReviews--;
        if (disaster.status === 'VERIFIED') {
          this.stats.activeDisasters--;
          if (disaster.severity === 'CRITICAL') this.stats.criticalAlerts--;
        }
      }

      this.allDisasters = this.allDisasters.filter(d => d.id !== id);
      this.filterData();

      this.disasterService.deleteDisaster(id).subscribe({
        next: () => this.loadData(),
        error: () => {
          this.allDisasters = originalAll;
          this.stats = originalStats;
          this.filterData();
          alert('Failed to delete record.');
        }
      });
    }
  }

  clearHistory() {
    if (confirm('Are you sure you want to delete ALL broadcasted alert records?')) {
      this.disasterService.deleteAllBroadcasted().subscribe(() => {
        this.loadData();
        alert('Alert history cleared.');
      });
    }
  }

  confirmReject(id: number) {
    this.targetId = id;
    this.showRejectModal = true;
    this.activeMenuId = null;
  }



  cancelConfirm() {
    this.showRejectModal = false;
    this.targetId = null;
  }

  confirmRejectAction() {
    if (this.targetId) {
      const disaster = this.allDisasters.find(d => d.id === this.targetId);
      const originalStatus = disaster ? disaster.status : null;
      const originalStats = { ...this.stats };

      if (disaster && disaster.status === 'PENDING') {
        this.stats.pendingReviews--;
        disaster.status = 'REJECTED';
        this.filterData();
      }

      this.disasterService.rejectDisaster(this.targetId).subscribe({
        next: () => {
          this.loadData();
          this.cancelConfirm();
        },
        error: (err) => {
          console.error('Reject failed:', err);
          if (disaster) disaster.status = originalStatus!;
          this.stats = originalStats;
          this.filterData();
          alert('Failed to reject incident.');
        }
      });
    }
  }



  viewDetails(disaster: DisasterEvent) {
    alert(`Incident Analysis:\n\nTitle: ${disaster.title || disaster.disasterType}\nLocation: ${disaster.locationName}\nStatus: ${disaster.status}`);
  }

  // Opens the broadcast modal for a specific disaster
  broadcast(id: number) {
    const target = this.allDisasters.find(d => d.id === id);
    if (!target) return;
    this.broadcastTarget = target;
    this.broadcastRegion = target.locationName || '';
    this.broadcastMessage = '';
    this.broadcastResult = null;
    this.broadcasting = false;
    this.showBroadcastModal = true;
    this.activeMenuId = null;
  }

  closeBroadcastModal() {
    this.showBroadcastModal = false;
    this.broadcastResult = null;
    this.broadcastTarget = null;
    this.loadData();
  }

  sendBroadcast() {
    if (!this.broadcastTarget?.id) return;
    this.broadcasting = true;
    this.disasterService.broadcastAlert(
      this.broadcastTarget.id,
      this.broadcastRegion,
      this.broadcastMessage
    ).subscribe({
      next: (result) => {
        this.broadcasting = false;
        this.broadcastResult = result;
      },
      error: (err) => {
        this.broadcasting = false;
        alert('Broadcast failed: ' + (err?.error?.message || 'Disaster must be VERIFIED first.'));
      }
    });
  }

  revokeBroadcast(id: number) {
    const target = this.allDisasters.find(d => d.id === id);
    if (target) target.broadcastAlertSent = false;
    this.activeMenuId = null;
    this.disasterService.revokeBroadcast(id).subscribe({
      next: () => this.loadData(),
      error: (err) => {
        console.error('Error revoking broadcast:', err);
        if (target) target.broadcastAlertSent = true;
        this.loadData();
      }
    });
  }

  quickBroadcast() {
    const latest = this.allDisasters.find(d => d.status === 'VERIFIED' && !d.broadcastAlertSent);
    if (latest) this.broadcast(latest.id!);
  }

  filterPending() {
    this.selectedStatus = 'PENDING';
    this.filterData();
  }

  openManualEventModal() {
    this.manualEvent = { title: '', locationName: '', disasterType: 'FIRE', severity: 'HIGH' };
    this.otherTypeSpecification = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  submitManualEvent() {
    if (!this.manualEvent.title || !this.manualEvent.locationName) return;

    // If OTHER is selected, append the specification to the title for clarity
    if (this.manualEvent.disasterType === 'OTHER' && this.otherTypeSpecification) {
      if (!this.manualEvent.title.includes(this.otherTypeSpecification)) {
        this.manualEvent.title = `${this.otherTypeSpecification}: ${this.manualEvent.title}`;
      }
    }

    const event: any = { ...this.manualEvent, status: 'PENDING', eventTime: new Date().toISOString() };

    // Optimistic Stats
    this.stats.pendingReviews++;

    this.disasterService.createDisaster(event).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => {
        console.error('Create failed:', err);
        this.stats.pendingReviews--;
        alert('Failed to create event. Please check required fields.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private setupSseConnection() {
    const token = this.authService.getToken();
    if (!token) return;

    this.closeSse();
    const url = `http://localhost:8080/api/notifications/stream?token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.sseStatus = 'CONNECTED';
    };

    this.eventSource.addEventListener('ACK_UPDATE', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        if (data.newReadyCount !== undefined) {
          this.stats.activeResponders = data.newReadyCount;
        }
      } catch (err) { }
    });

    // Listen for citizen help requests in real-time
    this.eventSource.addEventListener('HELP_REQUEST', (event: any) => {
      try {
        const req = JSON.parse(event.data);
        if (req && req.helpRequestId) {
          // Prepend if not already present
          const exists = this.helpRequests.find(r => r.id === req.helpRequestId);
          if (!exists) {
            this.helpRequests.unshift({
              id: req.helpRequestId,
              citizenId: req.citizenId,
              citizenName: req.citizenName,
              emergencyType: req.emergencyType,
              description: req.description,
              locationLabel: req.location,
              status: req.status,
              createdAt: req.createdAt
            });
            if (this.currentView !== 'HELP_REQUESTS') {
              this.newHelpRequestCount++;
            }
          }
        }
      } catch (err) { }
    });

    this.eventSource.onerror = () => {
      this.sseStatus = 'ERROR';
      this.closeSse();
      setTimeout(() => this.setupSseConnection(), 5000);
    };
  }

  private closeSse() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  trackById(index: number, item: any) {
    return item.id || index;
  }
}
