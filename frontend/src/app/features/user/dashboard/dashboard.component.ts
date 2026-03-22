import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { DisasterService } from '../../../core/services/disaster.service';
import {
  LucideAngularModule,
  AlertCircle,
  Phone,
  PhoneCall,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  PieChart,
  CircleDashed,
  Info,
  Flame,
  Siren,
  LifeBuoy,
  Shield
} from 'lucide-angular';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <lucide-icon name="shield" class="brand-icon"></lucide-icon>
          <span>Sentinel</span>
        </div>
        <nav class="nav-menu">
          <a class="nav-item" [class.active]="activeTab === 'dashboard'" (click)="activeTab='dashboard'">
            <lucide-icon name="home" [size]="20"></lucide-icon>
            Dashboard
          </a>
          <a class="nav-item" [class.active]="activeTab === 'report'" (click)="activeTab='report'">
            <lucide-icon name="triangle-alert" [size]="20"></lucide-icon>
            Report Incident
          </a>
          <a class="nav-item" [class.active]="activeTab === 'notifications'" (click)="activeTab='notifications'; loadNotifications()">
            <lucide-icon name="bell" [size]="20"></lucide-icon>
            Notifications
            <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </a>
          <a class="nav-item" [class.active]="activeTab === 'profile'" (click)="activeTab='profile'">
            <lucide-icon name="user" [size]="20"></lucide-icon>
            My Profile
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <lucide-icon name="activity" [size]="18"></lucide-icon>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <div class="welcome">
            <h1>Welcome back, {{ currentUser?.fullName || 'Citizen' }}</h1>
            <p>Your safety is our priority. Stay alert and stay safe.</p>
          </div>
          <div class="user-profile">
            <div class="profile-info">
              <span class="profile-name">{{ currentUser?.fullName || currentUser?.username }}</span>
              <span class="profile-role">Citizen Account</span>
            </div>
            <div class="profile-avatar">
              {{ (currentUser?.fullName || currentUser?.username || 'C')[0].toUpperCase() }}
            </div>
          </div>
        </header>

        <!-- Dashboard Tab -->
        <div *ngIf="activeTab === 'dashboard'" class="dashboard-wrapper">
          
          <!-- TOP SECTION – WELCOME + SAFETY STATUS -->
          <div class="safety-grid">
            <!-- Welcome Card -->
            <div class="welcome-card card">
               <div style="display: flex; align-items: center; gap: 24px;">
                  <div class="safety-pulse" [class.safe]="safetyLevel === 'SAFE'" [class.moderate]="safetyLevel === 'MODERATE'" [class.high]="safetyLevel === 'HIGH RISK'"></div>
                  <div style="flex: 1;">
                    <h2 class="welcome-title">Welcome back, {{ currentUser?.fullName || 'Citizen' }}</h2>
                    <p class="welcome-subtitle">"{{ smartSuggestion }}"</p>
                  </div>
               </div>
            </div>
            
            <div class="status-card-premium card" [class.bg-green]="safetyLevel === 'SAFE'" [class.bg-yellow]="safetyLevel === 'MODERATE'" [class.bg-red]="safetyLevel === 'HIGH RISK'">
               <div class="status-content">
                  <div class="status-label">CURRENT SAFETY STATUS</div>
                  <div class="status-value">{{ safetyLevel }}</div>
               </div>
               <lucide-icon [name]="safetyLevel === 'SAFE' ? 'shield-check' : 'triangle-alert'" [size]="40" class="status-icon"></lucide-icon>
            </div>
          </div>

          <div class="section-title-row" style="margin-top: 8px;">
            <h3 class="section-heading"><lucide-icon name="zap" [size]="18"></lucide-icon> Quick Actions</h3>
          </div>            
          
          <!-- Action Grid -->
          <div class="quick-actions-grid">
            <div class="action-card" (click)="activeTab = 'report'">
              <div class="action-icon red">
                <lucide-icon name="shield-alert" [size]="20" style="stroke-width: 2.5;"></lucide-icon>
              </div>
              <span>Report Incident</span>
            </div>
            <div class="action-card" (click)="callEmergency()">
              <div class="action-icon blue">
                <lucide-icon name="phone" [size]="20" style="stroke-width: 2.5;"></lucide-icon>
              </div>
              <span>Emergency Contact</span>
            </div>
            <div class="action-card" (click)="shareLocation()">
              <div class="action-icon green">
                <lucide-icon name="navigation" [size]="20" style="stroke-width: 2.5;"></lucide-icon>
              </div>
              <span>Share Location</span>
            </div>
            <div class="action-card" (click)="activeTab = 'notifications'">
              <div class="action-icon orange">
                <lucide-icon name="bell" [size]="20" style="stroke-width: 2.5;"></lucide-icon>
              </div>
              <span>View Alerts</span>
            </div>
          </div>
          <div class="dashboard-main-grid">
             <!-- Left Column: Safety Awareness Library -->
             <div class="main-left">
                <!-- Safety Card 1: Essential Kit (Primary) -->
                <div class="smart-suggestion-card" style="background: #eff6ff; border: 1.5px solid #bfdbfe; margin-bottom: 20px;">
                  <div class="suggestion-header" style="color: #1e40af;">
                    <lucide-icon name="info" [size]="16" style="color: #3b82f6;"></lucide-icon>
                    Safety Awareness: The Essential Kit
                  </div>
                  <p class="suggestion-text" style="color: #1e3a8a; font-weight: 600; font-size: 0.85rem; margin-top: 10px; line-height: 1.6;">
                    "Your safety starts with a 3-day emergency kit. Always keep water, a flashlight, power banks, and essential medications ready for immediate departure."
                  </p>
                </div>

                <!-- Safety Card 2: Evacuation Awareness (Amber) -->
                <div class="smart-suggestion-card" style="background: #fffbeb; border: 1.5px solid #fde68a; margin-bottom: 20px;">
                  <div class="suggestion-header" style="color: #92400e;">
                    <lucide-icon name="navigation" [size]="16" style="color: #d97706;"></lucide-icon>
                    Safety Awareness: Evacuation Planning
                  </div>
                  <p class="suggestion-text" style="color: #78350f; font-weight: 600; font-size: 0.85rem; margin-top: 10px; line-height: 1.6;">
                    "Map out two clear evacuation routes from your home. Practice your family emergency meeting spot and always follow official instructions during active crises."
                  </p>
                </div>

                <!-- Safety Card 3: Trust Official Sources (Sage) -->
                <div class="smart-suggestion-card" style="background: #f0fdf4; border: 1.5px solid #bbf7d0; margin-bottom: 20px;">
                  <div class="suggestion-header" style="color: #166534;">
                    <lucide-icon name="shield-check" [size]="16" style="color: #15803d;"></lucide-icon>
                    Safety Awareness: Trusted Information
                  </div>
                  <p class="suggestion-text" style="color: #14532d; font-weight: 600; font-size: 0.85rem; margin-top: 10px; line-height: 1.6;">
                    "Verify all crisis news before sharing. Trust only official Sentinel reports, government channels, and verified apps to prevent the spread of misinformation."
                  </p>
                </div>

                <!-- NEARBY INCIDENTS (Conditional) -->
                <div class="content-card card" *ngIf="nearbyIncidents.length > 0">
                  <div class="card-header-flex" style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
                    <h3 class="section-heading"><lucide-icon name="map-pin" [size]="18"></lucide-icon> Nearby Incidents</h3>
                  </div>
                  <div class="recent-list">
                    <div class="incident-item" *ngFor="let incident of nearbyIncidents">
                      <div class="incident-icon" [ngClass]="incident.type.toLowerCase()">
                        <lucide-icon [name]="getIncidentIcon(incident.type)" [size]="16"></lucide-icon>
                      </div>
                      <div class="incident-info">
                        <div class="incident-primary">{{ incident.title }}</div>
                        <div class="incident-secondary">{{ incident.severity }} Alert • {{ incident.distance }} away</div>
                      </div>
                      <div class="incident-status-tag" [class.active]="incident.status === 'VERIFIED'">{{ incident.status }}</div>
                    </div>
                  </div>
                </div>

                <!-- RECENT ACTIVITY (Conditional) -->
                <div class="content-card card" *ngIf="submissions.length > 0">
                   <div class="card-header-flex" style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9;">
                      <h3 class="section-heading"><lucide-icon name="clock" [size]="18"></lucide-icon> Your Recent Activity</h3>
                      <button class="view-all-btn" (click)="loadMySubmissions()" style="font-size: 0.7rem; background: #f1f5f9; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">Refresh</button>
                   </div>
                   <div class="recent-list" style="padding: 16px;">
                      <div class="activity-item" *ngFor="let sub of submissions.slice(0,4)" style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #f8fafc; display: flex; align-items: center; gap: 14px;">
                        <div class="activity-icon" [class.pending]="sub.status === 'PENDING'" [class.resolved]="sub.status === 'RESOLVED' || sub.status === 'COMPLETED'" style="width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f1f5f9;">
                          <lucide-icon name="activity" [size]="14"></lucide-icon>
                        </div>
                        <div class="activity-details" style="flex: 1;">
                           <span class="activity-title" style="font-weight: 700; color: #1e293b; font-size: 0.85rem; display: block;">{{ sub.type }} reported</span>
                           <span class="activity-time" style="font-size: 0.75rem; color: #94a3b8; font-weight: 500;">{{ sub.location }} • {{ sub.time }}</span>
                        </div>
                        <span class="status-tag" [class.pending]="sub.status === 'PENDING'" style="font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; background: #f1f5f9; color: #64748b;">{{ sub.status }}</span>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Right Column -->
             <div class="main-right">
                <!-- LOCAL ALERT SUMMARY -->
                <div class="content-card card" style="margin-bottom: 16px;">
                   <div class="card-header" style="padding: 18px 24px; border-bottom: 1px solid #f1f5f9;">
                     <h3 class="section-heading"><lucide-icon name="info" [size]="18"></lucide-icon> Local Alert Summary</h3>
                   </div>
                   <div style="padding: 24px;">
                     <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
                        <span style="font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">ACTIVE ALERTS IN AREA</span>
                        <span style="font-size: 2rem; font-weight: 950; color: #1e293b;" [class.text-danger]="unreadCount > 0">{{ unreadCount }}</span>
                     </div>
                     <div style="background: #f8fafc; border: 1px solid #eff6ff; padding: 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: #4b5563; display: flex; align-items: center; gap: 10px;">
                        <lucide-icon name="bell" [size]="14" style="color: #3b82f6;"></lucide-icon>
                        Last: {{ lastAlertType || 'No active alerts' }}
                      </div>
                   </div>
                </div>

                <!-- ALERT PERFORMANCE -->
                <div class="content-card card">
                   <div class="card-header" style="padding: 18px 24px; border-bottom: 1px solid #f1f5f9;">
                      <h3 class="section-heading"><lucide-icon name="pie-chart" [size]="18"></lucide-icon> Alert Performance</h3>
                   </div>
                   <div class="insight-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 24px; text-align: center;">
                      <div class="perf-item">
                         <div class="insight-circle blue" style="width: 48px; height: 48px; border: 3px solid #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #1e40af; font-size: 1rem; margin: 0 auto 8px;">{{ unreadCount }}</div>
                         <span style="font-size: 0.6rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">RECEIVED</span>
                      </div>
                      <div class="perf-item" style="opacity: 0.7;">
                         <div class="insight-circle green" style="width: 48px; height: 48px; border: 3px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #166534; font-size: 1rem; margin: 0 auto 8px;">0</div>
                         <span style="font-size: 0.6rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">ACK'D</span>
                      </div>
                      <div class="perf-item" style="opacity: 0.7;">
                         <div class="insight-circle gray" style="width: 48px; height: 48px; border: 3px solid #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #475569; font-size: 1rem; margin: 0 auto 8px;">0</div>
                         <span style="font-size: 0.6rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">IGNORED</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <footer class="dashboard-footer">
            "Your safety is our priority. Stay alert."
          </footer>
        </div>

        <!-- Report Incident Tab -->
        <div *ngIf="activeTab === 'report'">
          <div class="dashboard-grid">
            <!-- Left Column: Report Form + Helpline Hub -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div class="card report-card">
                <div class="card-header">
                  <div class="icon-box red">
                    <lucide-icon name="shield-alert" [size]="24"></lucide-icon>
                  </div>
                  <h3>Quick Incident Report</h3>
                </div>
                <div class="card-body">
                  <div class="form-grid">
                    <div class="form-group">
                      <label>Emergency Type</label>
                      <select [(ngModel)]="report.type" class="form-control">
                        <option value="FIRE">Fire Emergency</option>
                        <option value="FLOOD">Flood Alert</option>
                        <option value="MEDICAL">Medical Emergency</option>
                        <option value="CRIME">Security/Crime</option>
                        <option value="OTHER">Other Incident</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Location (Region/Area)</label>
                      <input type="text" [(ngModel)]="report.location" class="form-control" placeholder="E.g. Downtown, North Square">
                    </div>
                  </div>
                  <div class="form-group mt-3">
                    <label>Incident Details</label>
                    <textarea [(ngModel)]="report.description" class="form-control" rows="3" placeholder="Describe the emergency context..."></textarea>
                  </div>
                  <div class="submit-feedback success" *ngIf="submitSuccess">{{ submitSuccess }}</div>
                  <div class="submit-feedback error" *ngIf="submitError">{{ submitError }}</div>
                  <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="back-btn" (click)="activeTab = 'dashboard'">Back to Dashboard</button>
                    <button class="submit-btn" (click)="submitReport()" [disabled]="submitting" style="flex: 1; margin-top: 0;">
                      {{ submitting ? 'Submitting...' : 'Submit Emergency Report' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Emergency Helpline Hub Snug below the Report Form -->
              <div class="card helpline-hub">
                <div class="card-header-flex" style="padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="font-size: 1rem; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 10px; margin: 0;">
                    <lucide-icon name="phone" [size]="18" style="color: #dc2626;"></lucide-icon> Emergency Helpline Hub
                  </h3>
                  <span class="view-link" style="color: #dc2626; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">24/7 National Support</span>
                </div>
                <div class="helpline-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px;">
                  <div class="helpline-item" (click)="callEmergency()" style="border: 1.5px solid #f1f5f9; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s;">
                    <div class="helpline-icon" style="background: #fee2e2; color: #dc2626; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <lucide-icon name="phone-call" [size]="20"></lucide-icon>
                    </div>
                    <div class="helpline-details">
                      <span style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">MEDICAL EMERGENCY</span>
                      <span style="font-size: 1.1rem; font-weight: 900; color: #1e293b;">108</span>
                    </div>
                  </div>
                  <div class="helpline-item" style="border: 1.5px solid #f1f5f9; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s;">
                    <div class="helpline-icon" style="background: #e0f2fe; color: #0284c7; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <lucide-icon name="shield" [size]="20"></lucide-icon>
                    </div>
                    <div class="helpline-details">
                      <span style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">POLICE / SECURITY</span>
                      <span style="font-size: 1.1rem; font-weight: 900; color: #1e293b;">100</span>
                    </div>
                  </div>
                  <div class="helpline-item" style="border: 1.5px solid #f1f5f9; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s;">
                    <div class="helpline-icon" style="background: #fff7ed; color: #ea580c; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <lucide-icon name="flame" [size]="20"></lucide-icon>
                    </div>
                    <div class="helpline-details">
                      <span style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">FIRE SERVICES</span>
                      <span style="font-size: 1.1rem; font-weight: 900; color: #1e293b;">101</span>
                    </div>
                  </div>
                  <div class="helpline-item" style="border: 1.5px solid #f1f5f9; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s;">
                    <div class="helpline-icon" style="background: #f0fdf4; color: #16a34a; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <lucide-icon name="life-buoy" [size]="20"></lucide-icon>
                    </div>
                    <div class="helpline-details">
                      <span style="font-size: 0.65rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px;">DISASTER CONTROL</span>
                      <span style="font-size: 1.1rem; font-weight: 900; color: #1e293b;">1077</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="side-content">
               <!-- Area Status Card -->
               <div class="card status-card">
                 <div class="card-header">
                   <h3>Area Status</h3>
                   <span class="badge success" *ngIf="unreadCount === 0">Secure</span>
                   <span class="badge" [class.bg-yellow]="unreadCount > 0" *ngIf="unreadCount > 0" style="background: #fef3c7; color: #d97706;">Active Alerts</span>
                 </div>
                 <div class="status-info" style="padding: 24px 32px; display: flex; flex-direction: column; gap: 16px;">
                   <div class="status-item" style="display: flex; justify-content: space-between; align-items: center;">
                     <span class="label" style="color: #64748b; font-size: 0.875rem;">Local Region</span>
                     <span class="value" style="font-weight: 700; color: #111827;">{{ currentUser?.region || 'Update Profile' }}</span>
                   </div>
                   <div class="status-item" style="display: flex; justify-content: space-between; align-items: center;">
                     <span class="label" style="color: #64748b; font-size: 0.875rem;">Active Alerts</span>
                     <span class="value" [class.text-success]="unreadCount === 0" [class.text-danger]="unreadCount > 0">{{ unreadCount }} Alerts</span>
                   </div>
                 </div>
               </div>

               <!-- Recent Submissions Card -->
               <div class="card activity-card">
                 <div class="card-header">
                   <h3>Recent Submissions</h3>
                 </div>
                 <div class="activity-list">
                   <div class="activity-item" *ngFor="let r of submissions">
                     <div class="activity-icon" [class.pending]="r.status === 'PENDING'" [class.resolved]="r.status === 'RESOLVED' || r.status === 'COMPLETED'">
                       <lucide-icon name="activity" [size]="16"></lucide-icon>
                     </div>
                     <div class="activity-details">
                       <span class="activity-title">{{ r.type }} at {{ r.location }}</span>
                       <span class="activity-time">{{ r.time }}</span>
                     </div>
                     <span class="status-tag" [class.pending]="r.status === 'PENDING'">{{ r.status }}</span>
                   </div>
                   <div *ngIf="submissions.length === 0" class="empty-state">
                     No recent submissions found.
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
          <!-- Consistent Safety Footer -->
          <div class="dashboard-footer" style="margin-top: 40px; padding: 24px; text-align: center; color: #94a3b8; font-size: 0.85rem; font-weight: 600; font-style: italic; border-top: 1px solid #f1f5f9;">
            "Stay informed. Stay safe."
          </div>
        </div>

        <!-- =============== NOTIFICATIONS TAB =============== -->
        <div *ngIf="activeTab === 'notifications'" class="notif-page">
          <div class="notif-card">
            <div class="notif-header">
              <div style="display:flex; align-items:center; gap:12px;">
                <div class="icon-box" style="background:#eff6ff; color:#2563eb; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                  <lucide-icon name="bell" [size]="20"></lucide-icon>
                </div>
                <div>
                  <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:#111827;">Alert Notifications</h3>
                  <p style="margin:0; font-size:0.8rem; color:#64748b;">{{ unreadCount }} unread</p>
                </div>
              </div>
              <button class="btn-mark-all" (click)="markAllRead()" *ngIf="unreadCount > 0">
                Mark all as read
              </button>
            </div>

            <div class="notif-list">
              <div *ngIf="notifications.length === 0" class="notif-empty">
                <lucide-icon name="bell" [size]="36" style="color:#e2e8f0;"></lucide-icon>
                <p>No notifications yet. You'll be notified when an alert is broadcast for your region.</p>
              </div>

              <div class="notif-item" *ngFor="let n of notifications"
                   [class.unread]="n.status === 'SENT'">
                <div class="notif-dot" [class.unread-dot]="n.status === 'SENT'"></div>
                <div class="notif-body">
                  <p class="notif-msg">{{ n.message }}</p>
                  <div class="notif-meta">
                    <span class="notif-time">{{ n.sentAt | date:'medium' }}</span>
                    <span class="notif-region" *ngIf="n.targetRegion && n.targetRegion !== 'ALL'">📍 {{ n.targetRegion }}</span>
                    <span class="notif-status" [class.read]="n.status === 'READ'">{{ n.status }}</span>
                  </div>
                </div>
                <button class="btn-read" *ngIf="n.status === 'SENT'" (click)="markRead(n)">
                  <lucide-icon name="check" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- ================================================= -->


        <div *ngIf="activeTab === 'profile'" class="profile-page">
          <div class="profile-card">
            <!-- Header -->
            <div class="profile-card-header">
              <div class="avatar-large">
                {{ (profileForm.fullName || currentUser?.fullName || currentUser?.username || 'C')[0].toUpperCase() }}
              </div>
              <div>
                <h2>{{ profileForm.fullName || currentUser?.fullName || currentUser?.username }}</h2>
                <span class="role-chip">Citizen</span>
              </div>
              <button class="edit-toggle-btn" (click)="toggleEdit()" *ngIf="!editMode">
                <lucide-icon name="pencil" [size]="16"></lucide-icon>
                Edit Profile
              </button>
            </div>

            <!-- Success / Error messages -->
            <div class="alert-success" *ngIf="saveSuccess">
              ✅ Profile updated successfully!
            </div>
            <div class="alert-error" *ngIf="saveError">
              ❌ {{ saveError }}
            </div>

            <!-- Profile Fields Grid -->
            <div class="profile-fields">

              <!-- Full Name -->
              <div class="field-group">
                <label>Full Name</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.fullName" class="field-input" placeholder="Enter full name">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.fullName || '—' }}</span>
              </div>

              <!-- Email -->
              <div class="field-group">
                <label>Email Address</label>
                <input *ngIf="editMode" type="email" [(ngModel)]="profileForm.email" class="field-input" placeholder="Enter email">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.email || '—' }}</span>
              </div>

              <!-- Phone -->
              <div class="field-group">
                <label>Phone Number</label>
                <input *ngIf="editMode" type="tel" [(ngModel)]="profileForm.phone" class="field-input" placeholder="Enter phone number">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.phone || '—' }}</span>
              </div>

              <!-- Region -->
              <div class="field-group">
                <label>Region / Area</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.region" class="field-input" placeholder="E.g. North District">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.region || '—' }}</span>
              </div>

              <!-- City -->
              <div class="field-group">
                <label>City</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.city" class="field-input" placeholder="Enter city">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.city || '—' }}</span>
              </div>

              <!-- State -->
              <div class="field-group">
                <label>State</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.state" class="field-input" placeholder="Enter state">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.state || '—' }}</span>
              </div>

              <!-- Pincode -->
              <div class="field-group">
                <label>Pincode</label>
                <input *ngIf="editMode" type="text" [(ngModel)]="profileForm.pincode" class="field-input" placeholder="Enter pincode">
                <span *ngIf="!editMode" class="field-value">{{ profileForm.pincode || '—' }}</span>
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
    :host { --primary: #dc2626; --secondary: #111827; --bg: #f8fafc; --text: #334155; --card-bg: #ffffff; }
    .dashboard-container { display: flex; height: 100vh; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }

    /* Sidebar */
    .sidebar { width: 280px; background: #ffffff; color: #111827; padding: 32px 20px; display: flex; flex-direction: column; border-right: 1px solid #e2e8f0; }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 1.5rem; font-weight: 800; margin-bottom: 48px; padding-left: 12px; color: #111827; }
    .brand-icon { color: var(--primary); }
    .nav-menu { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s; text-decoration: none; }
    .nav-item:hover { background: #fef2f2; color: var(--primary); }
    .nav-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
    .sidebar-footer { padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; border: 1px solid #dc2626; background: transparent; color: #dc2626; cursor: pointer; font-weight: 600; transition: all 0.3s; }
    .logout-btn:hover { background: var(--primary); color: white; }

    /* Main Content */
    .main-content { flex: 1; overflow-y: auto; padding: 40px; }
    .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .welcome h1 { font-size: 1.875rem; font-weight: 700; color: var(--secondary); margin-bottom: 8px; }
    .welcome p { color: #64748b; font-size: 1rem; }
    .user-profile { display: flex; align-items: center; gap: 16px; background: white; padding: 8px 8px 8px 20px; border-radius: 50px; border: 1px solid #e2e8f0; }
    .profile-info { display: flex; flex-direction: column; text-align: right; }
    .profile-name { font-weight: 700; color: var(--secondary); font-size: 0.9rem; }
    .profile-role { font-size: 0.75rem; color: #64748b; }
    .profile-avatar { width: 40px; height: 40px; background: var(--secondary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }

    /* New Modern Dashboard Styles */
    .dashboard-wrapper { display: flex; flex-direction: column; gap: 32px; animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .safety-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    .welcome-card { padding: 32px; display: flex; align-items: center; border: 1px solid #f1f5f9; }
    .welcome-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; }
    .welcome-subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }
    
    .safety-pulse { width: 14px; height: 14px; border-radius: 50%; position: relative; }
    .safety-pulse::after { content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border-radius: 50%; opacity: 0.4; animation: pulse-ring 1.5s infinite; }
    .safety-pulse.safe { background: #10b981; } .safety-pulse.safe::after { border: 2px solid #10b981; }
    .safety-pulse.moderate { background: #f59e0b; } .safety-pulse.moderate::after { border: 2px solid #f59e0b; }
    .safety-pulse.high { background: #ef4444; } .safety-pulse.high::after { border: 2px solid #ef4444; }
    @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }

    .status-card-premium { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; color: white; border: none; }
    .status-card-premium.bg-green { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
    .status-card-premium.bg-yellow { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
    .status-card-premium.bg-red { background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); }
    .status-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; opacity: 0.8; margin-bottom: 4px; }
    .status-value { font-size: 1.5rem; font-weight: 900; }
    .status-icon { opacity: 0.3; }

    .quick-actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .action-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); }
    .action-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #cbd5e1; }
    .action-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .action-icon.red { background: #fef2f2; color: #ef4444; }
    .action-icon.blue { background: #eff6ff; color: #3b82f6; }
    .action-icon.green { background: #f0fdf4; color: #10b981; }
    .action-icon.orange { background: #fffbeb; color: #f59e0b; }
    .action-card span { font-weight: 700; font-size: 0.95rem; color: #1e293b; }

    .dashboard-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    .main-left, .main-right { display: flex; flex-direction: column; gap: 24px; }

    .smart-suggestion-card { background: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 16px; padding: 20px; }
    .suggestion-header { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 800; color: #3b82f6; margin-bottom: 8px; }
    .suggestion-text { color: #1e3a8a; font-weight: 600; line-height: 1.5; margin: 0; }

    /* Structural Layout Grid Restored */
    .dashboard-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
    .side-content { display: flex; flex-direction: column; gap: 32px; }

    .card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
    .card-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; }
    .card-header h3 { font-size: 1.25rem; font-weight: 700; color: var(--secondary); margin: 0; }
    .card-body { padding: 24px 32px 16px; }

    /* Form Styles Restored & Tightened */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 2px; }
    .form-control { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: var(--secondary); font-family: inherit; transition: all 0.3s; box-sizing: border-box; font-size: 0.9rem; }
    .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1); }
    .mt-3 { margin-top: 16px; }
    .submit-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: var(--primary); color: white; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
    .submit-btn:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .submit-feedback { padding: 10px 16px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; margin-top: 12px; }
    .submit-feedback.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .submit-feedback.error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }

    .card-header-flex { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .card-header-flex h3 { font-size: 1rem; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 10px; margin: 0; }
    .view-link { font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .view-all-btn { font-size: 0.75rem; background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 6px; color: #475569; font-weight: 700; cursor: pointer; }

    .recent-list { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
    .incident-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; border: 1px solid transparent; transition: all 0.2s; }
    .incident-item:hover { background: #f8fafc; border-color: #e2e8f0; }
    .incident-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .incident-icon.fire { background: #fee2e2; color: #dc2626; }
    .incident-icon.medical { background: #dcfce7; color: #15803d; }
    .incident-icon.crime { background: #f1f5f9; color: #4b5563; }
    .incident-icon.flood { background: #e0f2fe; color: #0284c7; }
    .incident-primary { font-weight: 700; color: #1e293b; font-size: 0.9rem; margin-bottom: 2px; }
    .incident-secondary { font-size: 0.75rem; color: #64748b; font-weight: 500; }
    .incident-status-tag { margin-left: auto; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; background: #f1f5f9; color: #64748b; }
    .incident-status-tag.active { background: #dcfce7; color: #15803d; }

    /* Activity History Styles Restored */
    .activity-card { margin-bottom: 40px; }
    .activity-list { padding: 16px 24px 32px; display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; transition: all 0.3s; }
    .activity-item:hover { background: #f8fafc; border-color: #e2e8f0; }
    .activity-icon { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .activity-icon.pending { background: #fef3c7; color: #d97706; }
    .activity-icon.resolved { background: #dcfce7; color: #15803d; }
    .activity-details { flex: 1; display: flex; flex-direction: column; }
    .activity-title { font-size: 0.875rem; font-weight: 600; color: var(--secondary); }
    .activity-time { font-size: 0.75rem; color: #94a3b8; }
    .status-tag { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .status-tag.pending { color: #d97706; }
    .empty-state { padding: 20px; text-align: center; color: #94a3b8; font-size: 0.875rem; font-style: italic; }

    .activity-row { display: grid; grid-template-columns: 100px 1fr 100px 100px; padding: 12px 16px; align-items: center; gap: 16px; border-bottom: 1px solid #f1f5f9; }
    .activity-row:last-child { border-bottom: none; }
    .activity-type { font-weight: 800; color: #1e293b; font-size: 0.8rem; }
    .activity-loc { font-size: 0.85rem; color: #475569; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .activity-date { font-size: 0.75rem; color: #94a3b8; }
    .activity-status-pill { font-size: 0.65rem; font-weight: 800; text-align: center; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; }
    .activity-status-pill.green { background: #ecfdf5; color: #059669; }
    .activity-status-pill.yellow { background: #fffbeb; color: #d97706; }

    .summary-card { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .summary-stat { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
    .stat-value { font-size: 2.25rem; font-weight: 900; color: #1e293b; }
    .summary-details { display: flex; flex-direction: column; gap: 8px; }
    .info-tag { font-size: 0.8rem; background: #f1f5f9; padding: 8px 12px; border-radius: 8px; color: #4b5563; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .severity-indicator { font-size: 0.7rem; font-weight: 800; padding: 6px; border-radius: 6px; text-align: center; border: 1.5px solid #d1fae5; color: #059669; }
    .severity-indicator.severe { border-color: #fee2e2; color: #dc2626; }

    .insight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 24px; text-align: center; }
    .insight-stat { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .insight-circle { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
    .insight-circle.blue { border: 3px solid #3b82f6; color: #3b82f6; }
    .insight-circle.green { border: 3px solid #10b981; color: #10b981; }
    .insight-circle.gray { border: 3px solid #94a3b8; color: #94a3b8; }
    .insight-stat span { font-size: 0.7rem; font-weight: 700; color: #64748b; }
    .insight-footer { text-align: center; padding-bottom: 20px; font-size: 0.7rem; color: #94a3b8; font-weight: 600; font-style: italic; }

    .mini-map-card { position: relative; cursor: pointer; border-radius: 20px; border: none; overflow: hidden; }
    .map-overlay { position: absolute; bottom: 12px; left: 12px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); padding: 6px 16px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

    .dashboard-footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em; font-style: italic; }

    /* Report Page V2 */
    .page-title { font-size: 1.875rem; font-weight: 800; color: #1e293b; margin: 0 0 4px 0; }
    .report-card-v2 { padding: 12px; border-radius: 28px; border: 1.5px solid #e2e8f0; background: white; }
    .type-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 8px; }
    .type-btn { padding: 16px; border-radius: 14px; border: 1.5px solid #f1f5f9; background: #f8fafc; font-weight: 800; font-size: 0.8rem; text-align: center; cursor: pointer; transition: all 0.2s; color: #64748b; }
    .type-btn:hover { border-color: #cbd5e1; background: #f1f5f9; }
    .type-btn.selected { background: #dc2626; color: white; border-color: #dc2626; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
    .input-with-icon { position: relative; }
    .field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .input-with-icon .form-control { padding-left: 44px; }
    .report-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .back-btn { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
    .submit-btn-premium { background: #dc2626; color: white; border: none; padding: 16px 32px; border-radius: 14px; font-weight: 800; font-size: 1rem; display: flex; align-items: center; gap: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); transition: all 0.2s; }
    .submit-btn-premium:hover:not(:disabled) { background: #b91c1c; transform: translateY(-2px); }
    .submit-btn-premium:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 1024px) {
      .safety-grid, .dashboard-main-grid { grid-template-columns: 1fr; }
      .quick-actions-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .quick-actions-grid { grid-template-columns: 1fr; }
      .activity-row { grid-template-columns: 1fr 1fr; gap: 8px; }
      .activity-date { display: none; }
    }

    /* ===== NOTIFICATIONS PAGE ===== */
    .notif-page { max-width: 720px; }
    .notif-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid #f1f5f9; }
    .btn-mark-all { font-size: 0.8rem; font-weight: 600; color: #2563eb; background: transparent; border: none; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: background 0.2s; }
    .btn-mark-all:hover { background: #eff6ff; }
    .notif-list { display: flex; flex-direction: column; }
    .notif-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 40px; color: #94a3b8; }
    .notif-item { display: flex; align-items: flex-start; gap: 14px; padding: 18px 32px; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
    .notif-item.unread { background: #f8faff; }
    .notif-item:hover { background: #f8fafc; }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; flex-shrink: 0; margin-top: 7px; }
    .notif-dot.unread-dot { background: #2563eb; box-shadow: 0 0 6px rgba(37,99,235,0.4); }
    .notif-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .notif-msg { font-size: 0.9rem; color: #111827; font-weight: 500; line-height: 1.5; margin: 0; }
    .notif-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .notif-time { font-size: 0.75rem; color: #94a3b8; }
    .notif-region { font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; }
    .notif-status { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #2563eb; letter-spacing: 0.04em; }
    .notif-status.read { color: #94a3b8; }
    .btn-read { padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #2563eb; cursor: pointer; display: flex; align-items: center; flex-shrink: 0; transition: all 0.2s; }
    .btn-read:hover { background: #eff6ff; border-color: #bfdbfe; }

    /* Notification badge on nav */
    .notif-badge { background: #dc2626; color: white; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 10px; margin-left: auto; }
    .profile-page { max-width: 720px; }
    .profile-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden; }
    .profile-card-header { display: flex; align-items: center; gap: 20px; padding: 32px 40px; background: linear-gradient(135deg, #111827 0%, #1e293b 100%); }
    .avatar-large { width: 72px; height: 72px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; flex-shrink: 0; }
    .profile-card-header h2 { color: white; font-size: 1.5rem; font-weight: 700; margin: 0 0 6px 0; }
    .role-chip { background: rgba(255,255,255,0.15); color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
    .edit-toggle-btn { margin-left: auto; display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.4); background: transparent; color: white; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .edit-toggle-btn:hover { background: rgba(255,255,255,0.15); border-color: white; }

    .alert-success { margin: 16px 40px 0; padding: 12px 20px; background: #dcfce7; color: #15803d; border-radius: 10px; font-weight: 600; font-size: 0.875rem; }
    .alert-error   { margin: 16px 40px 0; padding: 12px 20px; background: #fee2e2; color: #dc2626; border-radius: 10px; font-weight: 600; font-size: 0.875rem; }

    .profile-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 32px 40px; }
    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .field-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .field-value { font-size: 1rem; font-weight: 600; color: var(--secondary); padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .field-input { padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: var(--secondary); font-family: inherit; font-size: 0.95rem; transition: all 0.2s; width: 100%; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }

    .profile-actions { display: flex; gap: 12px; padding: 24px 40px; border-top: 1px solid #f1f5f9; }
    .btn-save { display: flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 10px; border: none; background: var(--primary); color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-save:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { display: flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }

    /* Toaster Styles */
    .toaster-container { position: fixed; top: 24px; right: 24px; z-index: 9999; animation: slideIn 0.3s ease-out; }
    .toaster { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-radius: 12px; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border-left: 4px solid #64748b; color: #1e293b; font-weight: 600; min-width: 300px; }
    .toaster.success { border-left-color: #10b981; }
    .toaster.error { border-left-color: #ef4444; }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  activeTab = 'dashboard';
  editMode = false;
  saving = false;
  saveSuccess = false;
  saveError = '';

  notifications: any[] = [];
  unreadCount = 0;
  private pollInterval: any;

  profileForm = {
    fullName: '',
    email: '',
    phone: '',
    region: '',
    city: '',
    state: '',
    pincode: ''
  };

  report = { type: 'FIRE', location: '', description: '' };
  submissions: any[] = [];
  toaster = { show: false, message: '', type: 'success' };

  // New Dashboard Logic State
  safetyLevel: 'SAFE' | 'MODERATE' | 'HIGH RISK' = 'SAFE';
  nearbyIncidents: any[] = [];
  insights = { received: 0, acknowledged: 0, ignored: 0 };
  smartSuggestion = 'Stay informed. Keep emergency contacts ready.';
  lastAlertType = '';
  lastAlertSeverity = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private disasterService: DisasterService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfileFromServer();
    this.loadUnreadCount();
    this.loadMySubmissions();
    this.loadRecentVerifiedIncidents();
    // Poll updates every 30s
    this.pollInterval = setInterval(() => {
      this.loadUnreadCount();
      this.loadMySubmissions();
      this.loadRecentVerifiedIncidents();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // ---- Notifications ----
  loadUnreadCount() {
    this.disasterService.getUnreadCount().subscribe({
      next: (r) => {
        this.unreadCount = r.unreadCount;
        this.updateSafetyStatus();
      },
      error: () => { }
    });
  }

  loadNotifications() {
    this.disasterService.getMyNotifications().subscribe({
      next: (list) => {
        this.notifications = list;
        this.unreadCount = list.filter((n: any) => n.status === 'SENT').length;
        if (list.length > 0) {
          const last = list[0];
          this.lastAlertType = last.disasterType || 'ALERT';
          this.lastAlertSeverity = last.severity || 'MODERATE';
          
          // Simplified Insight Logic
          this.insights.received = list.length;
          this.insights.acknowledged = list.filter((n: any) => n.status === 'READ').length;
          this.insights.ignored = list.filter((n: any) => n.status === 'SENT' && (Date.now() - new Date(n.sentAt).getTime() > 86400000)).length;
        }
        this.updateSafetyStatus();
      },
      error: () => { }
    });
  }

  updateSafetyStatus() {
    if (this.unreadCount > 5) {
      this.safetyLevel = 'HIGH RISK';
      this.smartSuggestion = '⚠️ HIGH RISK: Multiple active threats detected in your region. Secure your home and avoid low-lying areas.';
    } else if (this.unreadCount > 0) {
      this.safetyLevel = 'MODERATE';
      this.smartSuggestion = '🔔 ATTENTION: Local alerts are active. Review notifications and stay prepared for potential evacuations.';
    } else {
      this.safetyLevel = 'SAFE';
      this.smartSuggestion = '🛡️ ALL CLEAR: No active disasters in your immediate vicinity. Ensure your emergency kit is up to date.';
    }
  }

  loadRecentVerifiedIncidents() {
    this.disasterService.getAllDisasters().subscribe({
      next: (list) => {
        // Filter for verified disasters in the same region or globally prominent ones
        this.nearbyIncidents = list
          .filter(d => d.status === 'VERIFIED')
          .slice(0, 3)
          .map(d => ({
            ...d,
            distance: (Math.random() * 5 + 1).toFixed(1) // Mock distance for UI
          }));
      }
    });
  }

  getIncidentIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'FIRE': return 'flame';
      case 'FLOOD': return 'waves';
      case 'MEDICAL': return 'activity';
      case 'CRIME': return 'shield-alert';
      default: return 'triangle-alert';
    }
  }

  callEmergency() {
    alert('Dialing emergency services... (Simulation)');
    window.open('tel:108');
  }

  shareLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.showToaster(`Location verified: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`, 'success');
      }, () => {
        this.showToaster('Unable to access location services.', 'error');
      });
    }
  }

  markRead(n: any) {
    this.disasterService.markNotificationRead(n.id).subscribe({
      next: () => {
        n.status = 'READ';
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateSafetyStatus();
      },
      error: () => { }
    });
  }

  markAllRead() {
    const unread = this.notifications.filter(n => n.status === 'SENT');
    unread.forEach(n => this.markRead(n));
  }

  loadMySubmissions() {
    this.disasterService.getMyHelpRequests().subscribe({
      next: (list) => {
        this.submissions = list.map(hr => ({
          type: this.extractType(hr.description),
          location: hr.locationLabel || 'Unknown',
          time: this.formatTime(hr.createdAt),
          status: hr.status
        }));
      },
      error: () => { }
    });
  }

  private extractType(desc: string): string {
    const match = desc.match(/^\[(.*?)\]/);
    return match ? match[1] : 'INCIDENT';
  }

  private formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin/60)}h ago`;
    return date.toLocaleDateString();
  }

  showToaster(message: string, type: 'success' | 'error' = 'success') {
    this.toaster = { show: true, message, type };
    setTimeout(() => {
      this.toaster.show = false;
    }, 4000);
  }

  // ---- Profile ----
  loadProfileFromServer() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>('http://localhost:8080/api/profile', { headers }).subscribe({
      next: (profile) => {
        this.profileForm = {
          fullName: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          region: profile.region || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || ''
        };
      },
      error: () => { }
    });
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
    this.loadProfileFromServer();
  }

  saveProfile() {
    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
    this.http.put<any>('http://localhost:8080/api/profile', this.profileForm, { headers }).subscribe({
      next: (updated) => {
        this.saving = false;
        this.editMode = false;
        this.saveSuccess = true;
        this.profileForm = {
          fullName: updated.fullName || '',
          email: updated.email || '',
          phone: updated.phone || '',
          region: updated.region || '',
          city: updated.city || '',
          state: updated.state || '',
          pincode: updated.pincode || ''
        };
        if (this.currentUser) {
          this.currentUser.fullName = updated.fullName;
        }
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err: any) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Failed to save. Please try again.';
      }
    });
  }

  submitting = false;
  submitSuccess = '';
  submitError = '';

  submitReport() {
    if (!this.report.description || !this.report.location) {
      this.submitError = 'Please fill in Location and Incident Details before submitting.';
      return;
    }

    this.submitting = true;
    this.submitSuccess = '';
    this.submitError = '';

    const payload = {
      description: `[${this.report.type}] ${this.report.description}`,
      latitude: 0.0,   // Default – browser geolocation can be wired here
      longitude: 0.0,
      locationLabel: this.report.location,
      emergencyType: this.report.type
    };

    this.disasterService.submitIncidentReport(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showToaster('Emergency Report Submitted! Help is on the way.', 'success');
        this.loadMySubmissions();
        this.report = { type: 'FIRE', location: '', description: '' };
        this.activeTab = 'dashboard';
      },
      error: (err) => {
        this.submitting = false;
        this.showToaster(err?.error?.message || 'Failed to submit report. Please try again.', 'error');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}

