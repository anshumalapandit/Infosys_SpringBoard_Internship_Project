import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { DisasterService } from '../../../core/services/disaster.service';
import {
  LucideAngularModule,
  Shield,
  Home,
  TriangleAlert,
  FileText,
  Flame,
  Waves,
  Activity,
  ShieldAlert,
  User,
  Pencil,
  X,
  Check,
  MapPin,
  Bell,
  BellRing
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
        <div *ngIf="activeTab === 'dashboard' || activeTab === 'report'">
          <div class="dashboard-grid">
            <!-- Left Column: Report Form -->
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
                <button class="submit-btn" (click)="submitReport()" [disabled]="submitting">
                  {{ submitting ? 'Submitting...' : 'Submit Emergency Report' }}
                </button>
              </div>
            </div>

            <!-- Right Column: Area Status -->
            <div class="side-content">
              <div class="card status-card">
                <div class="card-header">
                  <h3>Area Status</h3>
                  <span class="badge success">Secure</span>
                </div>
                <div class="status-info">
                  <div class="status-item">
                    <span class="label">Local Region</span>
                    <span class="value">{{ currentUser?.region || 'Update Profile' }}</span>
                  </div>
                  <div class="status-item">
                    <span class="label">Active Alerts</span>
                    <span class="value text-success">0 Alerts</span>
                  </div>
                </div>
              </div>

              <div class="card activity-card">
                <div class="card-header">
                  <h3>Recent Submissions</h3>
                </div>
                <div class="activity-list">
                  <div class="activity-item" *ngFor="let r of submissions">
                    <div class="activity-icon" [class.pending]="r.status === 'PENDING'" [class.resolved]="r.status === 'RESOLVED'">
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

    /* Dashboard Grid */
    .dashboard-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
    .card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
    .card-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; }
    .card-header h3 { font-size: 1.25rem; font-weight: 700; color: var(--secondary); }
    .card-body { padding: 32px; }
    .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .icon-box.red { background: #fee2e2; color: var(--primary); }

    /* Form */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 0.875rem; font-weight: 600; color: #64748b; }
    .form-control { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: var(--secondary); font-family: inherit; transition: all 0.3s; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1); }
    .mt-3 { margin-top: 20px; }
    .submit-btn { width: 100%; margin-top: 16px; padding: 16px; border-radius: 12px; border: none; background: var(--primary); color: white; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
    .submit-btn:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .submit-feedback { padding: 10px 16px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; margin-top: 12px; }
    .submit-feedback.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .submit-feedback.error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }

    /* Side Content */
    .side-content { display: flex; flex-direction: column; gap: 32px; }
    .status-card .status-info { padding: 24px 32px; display: flex; flex-direction: column; gap: 16px; }
    .status-item { display: flex; justify-content: space-between; align-items: center; }
    .status-item .label { color: #64748b; font-size: 0.875rem; }
    .status-item .value { font-weight: 700; color: var(--secondary); }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .badge.success { background: #dcfce7; color: #15803d; }
    .text-success { color: #15803d; }
    .activity-list { padding: 16px 24px 32px; display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; transition: all 0.3s; }
    .activity-item:hover { background: #f8fafc; border-color: #e2e8f0; }
    .activity-icon { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; }
    .activity-icon.pending { background: #fef3c7; color: #d97706; }
    .activity-icon.resolved { background: #dcfce7; color: #15803d; }
    .activity-details { flex: 1; display: flex; flex-direction: column; }
    .activity-title { font-size: 0.875rem; font-weight: 600; color: var(--secondary); }
    .activity-time { font-size: 0.75rem; color: #94a3b8; }
    .status-tag { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .status-tag.pending { color: #d97706; }
    .empty-state { padding: 20px; text-align: center; color: #94a3b8; font-size: 0.875rem; font-style: italic; }

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
  submissions = [
    { type: 'FLOOD', location: 'Main Street', time: 'Yesterday', status: 'RESOLVED' }
  ];

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
    // Poll unread count every 30s
    this.pollInterval = setInterval(() => this.loadUnreadCount(), 30000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // ---- Notifications ----
  loadUnreadCount() {
    this.disasterService.getUnreadCount().subscribe({
      next: (r) => this.unreadCount = r.unreadCount,
      error: () => { }
    });
  }

  loadNotifications() {
    this.disasterService.getMyNotifications().subscribe({
      next: (list) => {
        this.notifications = list;
        this.unreadCount = list.filter((n: any) => n.status === 'SENT').length;
      },
      error: () => { }
    });
  }

  markRead(n: any) {
    this.disasterService.markNotificationRead(n.id).subscribe({
      next: () => {
        n.status = 'READ';
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: () => { }
    });
  }

  markAllRead() {
    const unread = this.notifications.filter(n => n.status === 'SENT');
    unread.forEach(n => this.markRead(n));
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
        this.submitSuccess = '✅ Emergency Report Submitted! Help is on the way.';
        this.submissions.unshift({
          type: this.report.type,
          location: this.report.location,
          time: 'Just now',
          status: 'PENDING'
        });
        this.report = { type: 'FIRE', location: '', description: '' };
        setTimeout(() => this.submitSuccess = '', 5000);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || '❌ Failed to submit report. Please try again.';
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}

