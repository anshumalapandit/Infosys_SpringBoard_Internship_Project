import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { DisasterService } from '../../../core/services/disaster.service';
import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider,
  Siren,
  List,
  History,
  MapPin,
  User,
  Pencil,
  X,
  Check,
  Bell,
  BellRing,
  TriangleAlert,
  ShieldCheck,
  Navigation
} from 'lucide-angular';

@Component({
  selector: 'app-responder-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Siren, List, History, MapPin, User, Pencil, X, Check,
        Bell, BellRing, TriangleAlert, ShieldCheck, Navigation
      })
    }
  ],
  template: `
    <div class="dashboard-layout">
      <nav class="sidebar glass-card">
        <div class="brand">
          <lucide-icon name="siren" class="brand-icon"></lucide-icon>
          Responder
        </div>
        <ul class="nav-links">
          <li [class.active]="activeTab === 'tasks'" (click)="activeTab='tasks'">
            <lucide-icon name="list" [size]="18"></lucide-icon>
            Active Tasks
          </li>
          <li [class.active]="activeTab === 'history'" (click)="activeTab='history'">
            <lucide-icon name="history" [size]="18"></lucide-icon>
            History
          </li>
          <li [class.active]="activeTab === 'profile'" (click)="activeTab='profile'">
            <lucide-icon name="user" [size]="18"></lucide-icon>
            My Profile
          </li>
        </ul>

        <!-- SSE Connection Status -->
        <div class="connection-status" [class.online]="sseStatus === 'CONNECTED'">
          <div class="status-dot"></div>
          <span>{{ sseStatus === 'CONNECTED' ? 'Real-time Linked' : 'Connecting...' }}</span>
        </div>

        <button class="logout-btn" (click)="logout()">Logout</button>
      </nav>

      <main class="content">
        <header>
          <h1>{{ activeTab === 'profile' ? 'My Profile' : 'Field Operations' }}</h1>
          <div class="user-info">
            <span class="welcome-text">Welcome, {{ currentUser?.fullName || 'Responder' }}</span>
            <div class="user-badge responder-badge">{{ currentUser?.responderType || 'Rescue' }} Staff</div>
          </div>
        </header>

        <!-- Tasks Tab -->
        <div *ngIf="activeTab === 'tasks'" class="task-list">
          
          <!-- CITIZEN HELP REQUESTS (SSE real-time) -->
          <div class=\"section-container\" *ngIf=\"citizenHelpRequests.length > 0\">
            <h2 class=\"section-title\" style=\"color:#dc2626;\">
              <lucide-icon name=\"triangle-alert\" [size]=\"20\" style=\"color:#dc2626;\"></lucide-icon>
              Citizen Help Requests
              <span class=\"broadcast-count\" style=\"background:#dc2626;\">{{ citizenHelpRequests.length }}</span>
            </h2>
            <div class=\"alert-grid\">
              <div class=\"citizen-req-card\" *ngFor=\"let req of citizenHelpRequests\" [class.new-alert]=\"req.isNew\"
                   [class.req-pending]=\"req.status === 'PENDING'\"
                   [class.req-assigned]=\"req.status === 'ASSIGNED'\"
                   [class.req-completed]=\"req.status === 'COMPLETED'\">
                <div class=\"unread-dot\" *ngIf=\"req.isNew && req.status === 'PENDING'\"></div>
                <div class=\"alert-header\">
                  <div class=\"alert-type\" style=\"background:#fff1f2; color:#dc2626;\">
                    <lucide-icon name=\"triangle-alert\" [size]=\"14\"></lucide-icon>
                    {{ req.emergencyType || 'HELP' }}
                  </div>
                  <span class=\"req-status-chip\" [class.pending]=\"req.status === 'PENDING'\"
                        [class.assigned]=\"req.status === 'ASSIGNED'\"
                        [class.completed]=\"req.status === 'COMPLETED'\">
                    {{ req.status }}
                  </span>
                </div>
                <h3 class=\"alert-title\">🆘 Help Needed: {{ req.emergencyType }}</h3>
                <p class=\"alert-msg\">{{ req.description }}</p>
                <div class=\"alert-footer\">
                  <div class=\"location-chip\">
                    <lucide-icon name=\"navigation\" [size]=\"12\"></lucide-icon>
                    {{ req.location || 'Unknown Location' }}
                  </div>
                  <div class=\"citizen-chip\">👤 {{ req.citizenName }}</div>
                </div>
                <!-- Action buttons based on status -->
                <div class=\"req-actions\" *ngIf=\"req.status !== 'COMPLETED'\">
                  <button class=\"req-accept-btn\" *ngIf=\"req.status === 'PENDING'\"
                          (click)=\"acceptHelpRequest(req)\" [disabled]=\"req.actioning\">
                    <lucide-icon name=\"check\" [size]=\"14\"></lucide-icon>
                    {{ req.actioning ? 'Accepting...' : 'Accept Request' }}
                  </button>
                  <button class=\"req-complete-btn\" *ngIf=\"req.status === 'ASSIGNED'\"
                          (click)=\"completeHelpRequest(req)\" [disabled]=\"req.actioning\">
                    <lucide-icon name=\"check\" [size]=\"14\"></lucide-icon>
                    {{ req.actioning ? 'Completing...' : 'Mark Complete' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- LIVE BROADCASTS SECTION (SSE Alerts) -->
          <div class="section-container" *ngIf="notifications.length > 0">
            <h2 class="section-title">
              <lucide-icon name="bell" [size]="20" style="color:#ef4444;"></lucide-icon>
              Emergency Broadcasts
              <span class="broadcast-count">{{ notifications.length }}</span>
            </h2>
            <div class="alert-grid">
              <div class="alert-card" *ngFor="let alert of notifications" [class.new-alert]="alert.isNew" [class.acked]="isAcknowledged(alert.disasterId)">
                
                <!-- Unread dot -->
                <div class="unread-dot" *ngIf="!isAcknowledged(alert.disasterId)"></div>

                <div class="alert-header">
                  <div class="alert-type">
                    <lucide-icon name="triangle-alert" [size]="14"></lucide-icon>
                    {{ alert.disasterType || 'ALERT' }}
                  </div>
                  <span class="alert-time">{{ alert.timeLabel || formatTime(alert.sentAt) || 'Recent' }}</span>
                </div>

                <h3 class="alert-title">{{ alert.title || alert.message | slice:0:60 }}</h3>
                <p class="alert-msg">{{ alert.message }}</p>

                <div class="alert-footer">
                  <div class="location-chip">
                    <lucide-icon name="navigation" [size]="12"></lucide-icon>
                    {{ alert.targetRegion || 'Affected Zone' }}
                  </div>

                  <!-- NOT YET ACKNOWLEDGED -->
                  <button class="btn-ready"
                          *ngIf="!isAcknowledged(alert.disasterId)"
                          (click)="acknowledge(alert.disasterId)"
                          [disabled]="processingAck === alert.disasterId">
                    <lucide-icon name="shield-check" [size]="16"></lucide-icon>
                    {{ processingAck === alert.disasterId ? 'Confirming...' : ' Confirm Receipt' }}
                  </button>

                  <!-- ALREADY ACKNOWLEDGED -->
                  <div class="ack-badge" *ngIf="isAcknowledged(alert.disasterId)">
                    <lucide-icon name="check" [size]="14"></lucide-icon>
                    Receipt Confirmed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No broadcasts yet -->
          <div class="no-broadcasts" *ngIf="notifications.length === 0">
            <lucide-icon name="bell" [size]="36"></lucide-icon>
            <p>No active emergency broadcasts. You will be notified in real-time.</p>
          </div>

          <!-- Assinged Tasks -->
          <div class="section-container">
            <h2 class="section-title">Field Assignments</h2>
            <div class="task-grid">
              <div class="task-card glass-card" *ngFor="let task of tasks">
                <div class="task-header">
                  <span class="type">{{ task.type }}</span>
                  <span class="time">{{ task.time }}</span>
                </div>
                <h3>{{ task.location }}</h3>
                <p>{{ task.description }}</p>
                <div class="actions">
                  <button class="btn-primary" (click)="updateStatus(task, 'IN_PROGRESS')" *ngIf="task.status === 'PENDING'">Accept Task</button>
                  <button class="btn-success" (click)="updateStatus(task, 'RESOLVED')" *ngIf="task.status === 'IN_PROGRESS'">Mark Resolved</button>
                  <span class="badge resolved" *ngIf="task.status === 'RESOLVED'">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- History Tab -->
        <div *ngIf="activeTab === 'history'" class="history-page">
           <div class="history-card" *ngFor="let ack of ackHistory">
              <div class="history-icon" [class.ready]="ack.readinessStatus === 'READY'">
                 <lucide-icon name="shield-check" [size]="20"></lucide-icon>
              </div>
              <div class="history-info">
                 <strong>Mission Ready: Alert #{{ ack.disasterId }}</strong>
                 <span>Readiness marked at {{ ack.acknowledgedAt | date:'medium' }}</span>
              </div>
              <div class="history-status ready">READY</div>
           </div>
           <div class="history-empty" *ngIf="ackHistory.length === 0">
              <lucide-icon name="history" [size]="48" style="margin-bottom:16px; opacity:0.3;"></lucide-icon>
              <p>No historical acknowledgment records found.</p>
           </div>
        </div>

        <!-- ===================== PROFILE TAB ===================== -->
        <div *ngIf="activeTab === 'profile'" class="profile-page">
          <div class="profile-card">

            <!-- Card Header -->
            <div class="profile-card-header">
              <div class="avatar-large">
                {{ (profileForm.fullName || currentUser?.fullName || currentUser?.username || 'R')[0].toUpperCase() }}
              </div>
              <div>
                <h2>{{ profileForm.fullName || currentUser?.fullName || currentUser?.username }}</h2>
                <span class="role-chip">{{ profileForm.responderType || currentUser?.responderType || 'Responder' }}</span>
              </div>
              <button class="edit-toggle-btn" (click)="toggleEdit()" *ngIf="!editMode">
                <lucide-icon name="pencil" [size]="16"></lucide-icon>
                Edit Profile
              </button>
            </div>

            <!-- Alerts -->
            <div class="alert-success" *ngIf="saveSuccess">✅ Profile updated successfully!</div>
            <div class="alert-error"   *ngIf="saveError">❌ {{ saveError }}</div>

            <!-- Fields Grid -->
            <div class="profile-fields">

              <div class="field-group">
                <label>Full Name</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.fullName" class="field-input" placeholder="Full name">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.fullName || '—' }}</span>
              </div>

              <div class="field-group">
                <label>Email Address</label>
                <input *ngIf="editMode" type="email" [(ngModel)]="profileForm.email" class="field-input" placeholder="Email">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.email || '—' }}</span>
              </div>

              <div class="field-group">
                <label>Phone Number</label>
                <input *ngIf="editMode" type="tel" [(ngModel)]="profileForm.phone" class="field-input" placeholder="Phone number">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.phone || '—' }}</span>
              </div>

              <div class="field-group">
                <label>Region / Area</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.region" class="field-input" placeholder="E.g. North District">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.region || '—' }}</span>
              </div>

              <div class="field-group">
                <label>City</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.city" class="field-input" placeholder="City">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.city || '—' }}</span>
              </div>

              <div class="field-group">
                <label>State</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.state" class="field-input" placeholder="State">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.state || '—' }}</span>
              </div>

              <div class="field-group">
                <label>Pincode</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.pincode" class="field-input" placeholder="Pincode">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.pincode || '—' }}</span>
              </div>

              <!-- Responder-specific: GPS Location -->
              <div class="field-group full-width">
                <label>
                  <lucide-icon name="map-pin" [size]="13"></lucide-icon>
                  GPS Location (for auto-assignment)
                </label>
                <div class="gps-row" *ngIf="editMode">
                  <input type="number" [(ngModel)]="profileForm.latitude"  class="field-input" placeholder="Latitude  (e.g. 13.0827)" step="0.0001">
                  <input type="number" [(ngModel)]="profileForm.longitude" class="field-input" placeholder="Longitude (e.g. 80.2707)" step="0.0001">
                </div>
                <span *ngIf="!editMode" class="field-value">
                  {{ profileForm.latitude && profileForm.longitude
                      ? profileForm.latitude + ', ' + profileForm.longitude
                      : '— (not set)' }}
                </span>
              </div>

            </div>

            <!-- Action Buttons -->
            <div class="profile-actions" *ngIf="editMode">
              <button class="btn-save" (click)="saveProfile()" [disabled]="saving">
                <lucide-icon name="check" [size]="16"></lucide-icon>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button class="btn-cancel" (click)="cancelEdit()">
                <lucide-icon name="x" [size]="16"></lucide-icon>
                Cancel
              </button>
            </div>
          </div>
        </div>
        <!-- ======================================================= -->

      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f8fafc; color: #111827; font-family: 'Inter', sans-serif; }
    
    /* Sidebar */
    .sidebar { width: 280px; padding: 32px 20px; display: flex; flex-direction: column; background: #ffffff; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh; }
    .brand { font-size: 1.5rem; font-weight: 800; margin-bottom: 48px; color: #111827; display: flex; align-items: center; gap: 12px; }
    .brand-icon { color: #dc2626; }
    .nav-links { list-style: none; padding: 0; flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .nav-links li { padding: 12px 16px; border-radius: 12px; cursor: pointer; color: #4b5563; display: flex; align-items: center; gap: 12px; font-weight: 500; transition: all 0.3s; }
    .nav-links li:hover { background: #fef2f2; color: #dc2626; }
    .nav-links li.active { background: #dc2626; color: white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
    
    /* SSE Status */
    .connection-status { margin: 20px 0; padding: 12px 16px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 600; color: #64748b; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
    .connection-status.online { background: #ecfdf5; color: #059669; }
    .connection-status.online .status-dot { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }

    /* Broadcast count badge */
    .broadcast-count { background: #ef4444; color: white; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 20px; margin-left: 4px; }

    /* No broadcasts placeholder */
    .no-broadcasts { background: #fafafa; border: 1.5px dashed #e2e8f0; border-radius: 20px; padding: 40px; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .no-broadcasts p { font-size: 0.9rem; font-weight: 500; }
    
    /* Content Area */
    .content { flex: 1; margin-left: 280px; padding: 40px; display: flex; flex-direction: column; gap: 32px; }
    header { display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 1.875rem; font-weight: 700; color: #111827; }
    .user-info { display: flex; align-items: center; gap: 16px; background: white; padding: 8px 8px 8px 20px; border-radius: 50px; border: 1px solid #e2e8f0; }
    .welcome-text { font-weight: 700; color: #111827; font-size: 0.9rem; }
    .responder-badge { background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }

    /* Sections */
    .section-container { margin-bottom: 32px; }
    .section-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px; }

    /* Alert Grid & Cards (SSE focus) */
    .alert-grid { display: grid; gap: 16px; margin-bottom: 40px; }
    .alert-card { background: white; border-radius: 20px; border: 1px solid #fee2e2; padding: 24px; box-shadow: 0 2px 10px rgba(220, 38, 38, 0.05); position: relative; border-left: 6px solid #ef4444; transition: all 0.3s; }
    .alert-card.acked { border-left-color: #10b981; border-color: #d1fae5; opacity: 0.75; }
    .unread-dot { position: absolute; top: 16px; right: 16px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
    .new-alert { animation: slide-in 0.5s ease-out; }
    .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .alert-type { font-size: 0.75rem; font-weight: 800; color: #ef4444; text-transform: uppercase; background: #fff1f2; padding: 2px 8px; border-radius: 6px; display: flex; align-items: center; gap: 6px; }
    .alert-time { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
    .alert-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .alert-msg { font-size: 0.95rem; color: #4b5563; line-height: 1.5; margin-bottom: 20px; }
    .alert-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 16px; }
    .location-chip { font-size: 0.8rem; color: #64748b; font-weight: 700; display: flex; align-items: center; gap: 6px; }

    .btn-ready { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border: none; padding: 12px 22px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(220,38,38,0.25); letter-spacing: 0.01em; }
    .btn-ready:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(220,38,38,0.35); }
    .btn-ready:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .ack-badge { background: #ecfdf5; color: #059669; border: 1.5px solid #a7f3d0; padding: 10px 18px; border-radius: 12px; font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }

    @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }

    /* Task Grid */
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .task-card { padding: 24px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; }

    /* History Styles */
    .history-page { display: flex; flex-direction: column; gap: 12px; max-width: 800px; }
    .history-card { padding: 20px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 20px; }
    .history-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #64748b; }
    .history-icon.ready { background: #ecfdf5; color: #10b981; }
    .history-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .history-info strong { font-size: 0.95rem; color: #1e293b; }
    .history-info span { font-size: 0.8rem; color: #94a3b8; }
    .history-status { font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; }
    .history-status.ready { background: #d1fae5; color: #065f46; }

    /* Profile Styles */
    .profile-page { max-width: 720px; }
    .profile-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden; }
    .profile-card-header { display: flex; align-items: center; gap: 20px; padding: 32px 40px; background: linear-gradient(135deg, #111827 0%, #1e293b 100%); }
    .avatar-large { width: 72px; height: 72px; border-radius: 50%; background: #dc2626; color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; flex-shrink: 0; }
    .profile-card-header h2 { color: white; font-size: 1.5rem; font-weight: 700; margin: 0 0 6px 0; }
    .role-chip { background: rgba(255,255,255,0.15); color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
    .edit-toggle-btn { margin-left: auto; display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.4); background: transparent; color: white; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .edit-toggle-btn:hover { background: rgba(255,255,255,0.15); border-color: white; }
    .alert-success { margin: 16px 40px 0; padding: 12px 20px; background: #dcfce7; color: #15803d; border-radius: 10px; font-weight: 600; font-size: 0.875rem; }
    .alert-error   { margin: 16px 40px 0; padding: 12px 20px; background: #fee2e2; color: #dc2626; border-radius: 10px; font-weight: 600; font-size: 0.875rem; }
    .profile-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 32px 40px; }
    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .full-width { grid-column: 1 / -1; }
    .field-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; }
    .field-value { font-size: 1rem; font-weight: 600; color: #111827; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .field-input { padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #111827; font-family: inherit; font-size: 0.95rem; transition: all 0.2s; width: 100%; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: #dc2626; background: white; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
    .gps-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .profile-actions { display: flex; gap: 12px; padding: 24px 40px; border-top: 1px solid #f1f5f9; }
    .btn-save { display: flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 10px; border: none; background: #dc2626; color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-save:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { display: flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
    .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; border: 1.5px solid #dc2626; background: transparent; color: #dc2626; cursor: pointer; font-weight: 700; margin-top: auto; }
    .logout-btn:hover { background: #dc2626; color: white; }

    @keyframes slide-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulse-glow { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

    /* Citizen Help Request Cards */
    .citizen-req-card { background: white; border-radius: 20px; border: 1px solid #fca5a5; padding: 24px; box-shadow: 0 2px 10px rgba(220, 38, 38, 0.08); position: relative; border-left: 6px solid #dc2626; margin-bottom: 0; }
    .citizen-req-card.new-alert { animation: slide-in 0.5s ease-out; }
    .citizen-req-card.req-assigned { border-left-color: #d97706; border-color: #fcd34d; }
    .citizen-req-card.req-completed { border-left-color: #10b981; border-color: #a7f3d0; opacity: 0.8; }
    .citizen-chip { font-size: 0.8rem; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 4px 10px; border-radius: 8px; }

    /* Status chip inside help request card */
    .req-status-chip { font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .req-status-chip.pending { background: #fee2e2; color: #dc2626; }
    .req-status-chip.assigned { background: #fffbeb; color: #d97706; }
    .req-status-chip.completed { background: #d1fae5; color: #059669; }

    /* Action buttons */
    .req-actions { margin-top: 16px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .req-accept-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; border: none; background: #dc2626; color: white; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .req-accept-btn:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
    .req-accept-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .req-complete-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; border: none; background: #059669; color: white; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .req-complete-btn:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
    .req-complete-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class ResponderDashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  activeTab = 'tasks';
  editMode = false;
  saving = false;
  saveSuccess = false;
  saveError = '';

  // Notifications (Live Alerts)
  notifications: any[] = [];
  ackHistory: any[] = [];
  acknowledgedIds: Set<number> = new Set();
  processingAck: number | null = null;

  // Citizen Help Requests (real-time)
  citizenHelpRequests: any[] = [];

  // SSE State
  private eventSource: EventSource | null = null;
  sseStatus: 'CONNECTING' | 'CONNECTED' | 'ERROR' = 'CONNECTING';

  profileForm: any = {
    fullName: '',
    email: '',
    phone: '',
    region: '',
    responderType: 'RESCUE_STAFF',
    badgeNumber: '',
    latitude: null,
    longitude: null,
    pincode: ''
  };

  tasks = [
    { id: 1, type: 'CRIME', location: 'Commercial St. Alley', description: 'Suspect spotted trying to bypass security gate.', time: '15 mins ago', status: 'RESOLVED' },
    { id: 2, type: 'TRAFFIC', location: 'Highway 101 Exit', description: 'Multi-vehicle collision blocking two lanes.', time: '40 mins ago', status: 'PENDING' }
  ];

  constructor(
    private authService: AuthService,
    private disasterService: DisasterService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.initProfileForm();
    this.loadInitialData();
    this.setupSseConnection();
  }

  ngOnDestroy() {
    this.closeSse();
  }

  initProfileForm() {
    if (this.currentUser) {
      this.profileForm = {
        fullName: this.currentUser.fullName || '',
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || '',
        region: this.currentUser.region || '',
        responderType: this.currentUser.responderType || 'RESCUE_STAFF',
        badgeNumber: this.currentUser.badgeNumber || '',
        latitude: this.currentUser.latitude || null,
        longitude: this.currentUser.longitude || null,
        pincode: this.currentUser.pincode || ''
      };
    }
  }

  loadInitialData() {
    // Load existing notifications — filter out empty/invalid ones
    this.disasterService.getResponderNotifications().subscribe(msgs => {
      this.notifications = (msgs || [])
        .filter(n => n && n.message && n.message.trim() !== '' && n.disasterId)
        .map(n => this.normalizeAlert(n));
    });

    // Load ack history to prevent re-marking ready
    this.disasterService.getResponderAcks().subscribe(acks => {
      this.ackHistory = acks || [];
      this.ackHistory.forEach(a => this.acknowledgedIds.add(Number(a.disasterId)));
    });
  }

  /**
   * Normalize a raw backend Notification entity into a consistent display shape.
   * Backend returns: { id, disasterId, userId, message, sentAt, status, targetRegion, recipientRole }
   */
  normalizeAlert(n: any): any {
    // Extract disasterType from the message text (e.g. "DISASTER ALERT: flood | Severity...")
    const typeMatch = n.message?.match(/DISASTER ALERT:\s*([^\|]+)/i);
    const extractedType = typeMatch ? typeMatch[1].trim().toUpperCase() : null;

    // Use title if available; otherwise use message as title prefix
    const title = n.title || (n.message ? n.message.split('|')[0].replace(/DISASTER ALERT:/i, '').trim() : 'Emergency Alert');

    return {
      ...n,
      disasterId: Number(n.disasterId),
      disasterType: n.disasterType || extractedType || 'ALERT',
      title: title,
      message: n.message,
      targetRegion: n.targetRegion || 'Affected Zone',
      isNew: false
    };
  }

  /** Format ISO timestamp to relative time label */
  formatTime(sentAt: string): string {
    if (!sentAt) return 'Recent';
    const diff = Date.now() - new Date(sentAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(sentAt).toLocaleDateString();
  }

  setupSseConnection() {
    const token = this.authService.getToken();
    if (!token) return;

    this.closeSse();
    this.sseStatus = 'CONNECTING';

    const url = `http://localhost:8080/api/notifications/stream?token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.sseStatus = 'CONNECTED';
    };

    this.eventSource.onerror = () => {
      this.sseStatus = 'ERROR';
      setTimeout(() => this.setupSseConnection(), 5000); // Retry logic
    };

    // Listen for incoming admin alerts — normalize and prepend
    this.eventSource.addEventListener('ALERT', (event: any) => {
      try {
        const raw = JSON.parse(event.data);
        const normalized = this.normalizeAlert({ ...raw, isNew: true });
        // Avoid duplicates
        if (!this.notifications.find(n => n.disasterId === normalized.disasterId)) {
          this.notifications.unshift(normalized);
        }
      } catch (e) { }
    });

    // Listen for citizen help requests in real-time
    this.eventSource.addEventListener('HELP_REQUEST', (event: any) => {
      try {
        const req = JSON.parse(event.data);
        if (req && req.helpRequestId) {
          const exists = this.citizenHelpRequests.find(r => r.helpRequestId === req.helpRequestId);
          if (!exists) {
            this.citizenHelpRequests.unshift({ ...req, isNew: true, timeLabel: 'Just now' });
          }
        }
      } catch (e) { }
    });
  }

  closeSse() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  acknowledge(disasterId: number) {
    this.processingAck = disasterId;
    this.disasterService.acknowledgeAlert(disasterId, 'READY').subscribe({
      next: (res) => {
        this.acknowledgedIds.add(disasterId);
        this.ackHistory.unshift(res);
        this.processingAck = null;
      },
      error: (err) => {
        alert('Failed to sync readiness: ' + (err?.error?.message || 'Server error'));
        this.processingAck = null;
      }
    });
  }

  isAcknowledged(disasterId: number): boolean {
    return this.acknowledgedIds.has(disasterId);
  }

  updateStatus(task: any, status: string) {
    task.status = status;
  }

  toggleEdit() {
    this.editMode = true;
    this.saveSuccess = false;
    this.saveError = '';
  }

  cancelEdit() {
    this.editMode = false;
    this.saveSuccess = false;
    this.saveError = '';
    this.initProfileForm();
  }

  saveProfile() {
    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

    this.http.put<any>('http://localhost:8080/api/users/profile', this.profileForm, { headers }).subscribe({
      next: (updatedUser: any) => {
        this.authService.updateUser(updatedUser);
        this.currentUser = updatedUser;
        this.saving = false;
        this.editMode = false;
        this.saveSuccess = true;
        this.initProfileForm();
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Failed to update profile';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Responder accepts a PENDING citizen help request → moves it to ASSIGNED.
   */
  acceptHelpRequest(req: any) {
    req.actioning = true;
    this.disasterService.acceptHelpRequest(req.helpRequestId).subscribe({
      next: () => {
        req.status = 'ASSIGNED';
        req.isNew = false;
        req.actioning = false;
      },
      error: (err) => {
        req.actioning = false;
        console.error('Failed to accept help request:', err);
      }
    });
  }

  /**
   * Responder marks an ASSIGNED citizen help request as COMPLETED.
   */
  completeHelpRequest(req: any) {
    req.actioning = true;
    this.disasterService.completeHelpRequest(req.helpRequestId).subscribe({
      next: () => {
        req.status = 'COMPLETED';
        req.actioning = false;
      },
      error: (err) => {
        req.actioning = false;
        console.error('Failed to complete help request:', err);
      }
    });
  }
}
