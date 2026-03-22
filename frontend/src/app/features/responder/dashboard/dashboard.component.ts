import { Component, OnInit, OnDestroy, AfterViewChecked, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { DisasterService, RescueTaskDTO } from '../../../core/services/disaster.service';
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
  Navigation,
  ClipboardList,
  Map,
  Trash2,
  RotateCcw,
  FileText,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Megaphone
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
        Bell, BellRing, TriangleAlert, ShieldCheck, Navigation, ClipboardList, Map, Trash2, RotateCcw,
        FileText, Camera, ImageIcon, UploadCloud, Megaphone
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
          <li [class.active]="activeTab === 'tasks'" (click)="setTab('tasks')">
            <lucide-icon name="list" [size]="18"></lucide-icon>
            Pending Tasks
          </li>
          <li [class.active]="activeTab === 'ongoing'" (click)="setTab('ongoing')">
            <lucide-icon name="navigation" [size]="18"></lucide-icon>
            Ongoing Tasks
          </li>
          <li [class.active]="activeTab === 'notifications'" (click)="setTab('notifications')">
            <lucide-icon name="bell" [size]="18"></lucide-icon>
            Notifications
            <span class="badge-dot" *ngIf="notifications.length > 0"></span>
          </li>
          <li [class.active]="activeTab === 'map'" (click)="setTab('map')">
            <lucide-icon name="map" [size]="18"></lucide-icon>
            Operations Map
          </li>
          <li [class.active]="activeTab === 'history'" (click)="setTab('history')">
            <lucide-icon name="history" [size]="18"></lucide-icon>
            Mission History
          </li>
          <li [class.active]="activeTab === 'profile'" (click)="setTab('profile')">
            <lucide-icon name="user" [size]="18"></lucide-icon>
            My Profile
          </li>
        </ul>

        <div class="connection-status" [class.online]="sseStatus === 'CONNECTED'">
          <div class="status-dot"></div>
          <span>{{ sseStatus === 'CONNECTED' ? 'Real-time Linked' : 'Connecting...' }}</span>
        </div>

        <button class="logout-btn" (click)="logout()">Logout</button>
      </nav>

      <main class="content">
        <header>
          <h1 [ngSwitch]="activeTab">
            <span *ngSwitchCase="'profile'">My Profile</span>
            <span *ngSwitchCase="'map'">Operations Map</span>
            <span *ngSwitchCase="'history'">Mission History</span>
            <span *ngSwitchCase="'notifications'">Notifications Hub</span>
            <span *ngSwitchCase="'ongoing'">Ongoing Rescue Ops</span>
            <span *ngSwitchDefault>Pending Rescue Tasks</span>
          </h1>
          <div class="user-info">
            <span class="welcome-text">Welcome, {{ currentUser?.fullName || 'Responder' }}</span>
            <div class="user-badge responder-badge">{{ currentUser?.responderType || 'Rescue' }} Staff</div>
          </div>
        </header>

        <!-- Pending Tasks View -->
        <div *ngIf="activeTab === 'tasks'" class="task-list">
          <div class="section-container">
            <div class="section-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
                <lucide-icon name="clipboard-list" [size]="20" style="color: #eab308;"></lucide-icon>
                New Assignments
              </h2>
              <button class="refresh-btn-light" (click)="loadRescueTasks()" [disabled]="mapLoading">
                <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
                Refresh
              </button>
            </div>

            <div class="task-grid" *ngIf="pendingTasks.length > 0">
              <div class="task-card" *ngFor="let task of pendingTasks" style="border-left-color: #eab308">
                <div class="task-info-row">
                  <span class="label">Zone:</span>
                  <span class="value">{{ task.zoneName }}</span>
                </div>
                <div class="task-info-row">
                  <span class="label">Task:</span>
                  <span class="value" style="font-weight: 600;">{{ task.description }}</span>
                </div>
                <div class="task-info-row" *ngIf="task.latitude && task.longitude">
                   <span class="label">Location:</span>
                   <span class="value" style="font-family: monospace; color: #6366f1;">
                     {{ task.latitude.toFixed(4) }}, {{ task.longitude.toFixed(4) }}
                   </span>
                </div>
                <div class="task-actions">
                  <button class="btn-task start" (click)="updateRescueStatus(task.taskId, 'ONGOING')">
                    Start Task
                  </button>
                </div>
              </div>
            </div>
            
            <div class="no-broadcasts" *ngIf="pendingTasks.length === 0">
              <lucide-icon name="clipboard-list" [size]="48" style="opacity: 0.3;"></lucide-icon>
              <p>No new pending tasks.</p>
              <span>Switch to 'Ongoing' to manage current missions.</span>
            </div>
          </div>
        </div>

        <!-- Ongoing Tasks View -->
        <div *ngIf="activeTab === 'ongoing'" class="task-list">
          <div class="section-container">
            <div class="section-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
                <lucide-icon name="navigation" [size]="20" style="color: #2563eb;"></lucide-icon>
                Current Operations
              </h2>
            </div>

            <div class="task-grid" *ngIf="ongoingTasks.length > 0">
              <div class="task-card" *ngFor="let task of ongoingTasks" style="border-left-color: #2563eb">
                <div class="task-info-row">
                  <span class="label">Zone:</span>
                  <span class="value">{{ task.zoneName }}</span>
                </div>
                <div class="task-info-row">
                  <span class="label">Task:</span>
                  <span class="value" style="font-weight: 600;">{{ task.description }}</span>
                </div>
                <div class="task-actions">
                  <button class="btn-task complete" (click)="openReportModal(task)">
                    Mark Completed & Submit Report
                  </button>
                </div>
              </div>
            </div>
            
            <div class="no-broadcasts" *ngIf="ongoingTasks.length === 0">
              <lucide-icon name="navigation" [size]="48" style="opacity: 0.3;"></lucide-icon>
              <p>No ongoing operations.</p>
              <span>Click 'Start Task' on a pending assignment to begin.</span>
            </div>
          </div>
        </div>

        <!-- Notifications View -->
        <div *ngIf="activeTab === 'notifications'" class="notifications-page">
          <div class="section-container">
            <!-- Command Messages Section -->
            <div class="section-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <h2 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
                <lucide-icon name="shield-check" [size]="20" style="color: #2563eb;"></lucide-icon>
                Command Center Messages
              </h2>
              <div style="display: flex; gap: 12px;">
                <button (click)="loadNotifications()" class="clear-btn" style="color: #2563eb; border-color: #dbeafe;">
                  <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon> Refresh
                </button>
                <button (click)="clearDirectMessages()" class="clear-btn" *ngIf="directMessages.length > 0">
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon> Clear Messages
                </button>
              </div>
            </div>

            <div class="alert-grid" *ngIf="directMessages.length > 0" style="grid-template-columns: 1fr; margin-bottom: 40px;">
              <div class="alert-card" *ngFor="let msg of directMessages" style="border-left: 6px solid #2563eb; background: #f0f9ff; padding: 20px; border-radius: 16px;">
                <div class="alert-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: #2563eb; color: white; padding: 6px; border-radius: 8px; display: flex;">
                      <lucide-icon name="shield-check" [size]="18"></lucide-icon>
                    </div>
                    <div>
                      <h3 style="font-size: 1rem; font-weight: 800; color: #1e3a8a; margin: 0;">Internal Instruction</h3>
                      <div style="font-size: 0.7rem; font-weight: 700; color: #2563eb; text-transform: uppercase; margin-top: 2px;">
                        Priority: {{ msg.severity || 'NORMAL' }}
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">{{ msg.sentAt | date:'short' }}</span>
                    <button (click)="deleteNotification(msg.id)" class="delete-icon-btn" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;">
                      <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </div>
                <!-- Clean up message content from tags -->
                <div style="margin-top: 16px; font-size: 0.95rem; line-height: 1.6; color: #1e40af; background: white; padding: 16px; border-radius: 12px; border: 1px solid #bee3f8;">
                  {{ msg.message.replace('[Control Center Message]\n', '').split('\nPriority:')[0] }}
                </div>
              </div>
            </div>

            <div class="no-broadcasts" *ngIf="directMessages.length === 0" style="margin-bottom: 40px; padding: 40px;">
              <lucide-icon name="shield-check" [size]="32" style="opacity: 0.2;"></lucide-icon>
              <p style="font-size: 0.9rem;">No direct instructions from Command.</p>
            </div>

            <!-- Disaster Broadcasts Section -->
            <div class="section-header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-top: 1px solid #e2e8f0; padding-top: 32px;">
              <h2 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
                <lucide-icon name="megaphone" [size]="20" style="color: #ef4444;"></lucide-icon>
                Disaster Broadcast Alerts
              </h2>
              <button (click)="clearBroadcasts()" class="clear-btn" *ngIf="broadcastAlerts.length > 0">
                <lucide-icon name="trash-2" [size]="14"></lucide-icon> Clear All Alerts
              </button>
            </div>

            <div class="alert-grid" *ngIf="broadcastAlerts.length > 0" style="grid-template-columns: 1fr;">
              <div class="alert-card" *ngFor="let alert of broadcastAlerts" style="border-left: 6px solid #ef4444; padding: 24px;">
                <div class="alert-header" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; gap: 8px;">
                      <div class="alert-type" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: #fee2e2; color: #dc2626; font-weight: 700;">
                        {{ alert.disasterType || 'ALERT' }}
                      </div>
                      <div class="severity-badge" [ngClass]="(alert.severity || 'moderate').toLowerCase()" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
                        {{ alert.severity || 'MODERATE' }}
                      </div>
                    </div>
                    <h3 class="alert-title" style="font-size: 1.15rem; margin: 4px 0; color: #1e293b; font-weight: 800;">{{ alert.title }}</h3>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="alert-time" style="font-size: 0.75rem; color: #64748b; font-weight: 600;">{{ alert.sentAt | date:'short' }}</span>
                    <button (click)="deleteNotification(alert.id)" class="delete-icon-btn" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; display: flex;">
                      <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </div>
                <p class="alert-msg" style="font-size: 0.95rem; margin-bottom: 16px; line-height: 1.6; color: #475569;">{{ alert.message }}</p>
                <div class="alert-footer" style="padding-top: 12px; border-top: 1px solid #f1f5f9;">
                  <div class="location-chip" style="font-size: 0.8rem; background: #f8fafc; color: #64748b; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                    <lucide-icon name="navigation" [size]="12"></lucide-icon>
                    Location Target: {{ alert.targetRegion || 'Affected District' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="no-broadcasts" *ngIf="broadcastAlerts.length === 0" style="padding: 40px;">
              <lucide-icon name="bell" [size]="48" style="opacity: 0.2;"></lucide-icon>
              <p>No active disaster broadcasts.</p>
            </div>
          </div>
        </div>
 
        <!-- Operations Map -->
        <div *ngIf="activeTab === 'map'" class="map-container-wrapper glass-card" style="display: flex; flex-direction: column; height: 75vh; background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; position: relative;">
          <div class="map-header" style="padding: 16px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; z-index: 500;">
            <div>
              <h2 style="font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0;">Active Rescue Operations Map</h2>
              <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 0.7rem; font-weight: 700;">
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; background:#eab308; border-radius:50%;"></span> PENDING</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; background:#3b82f6; border-radius:50%;"></span> ONGOING</span>
                <span style="display:flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; background:#22c55e; border-radius:50%;"></span> COMPLETED</span>
              </div>
            </div>
            <button (click)="refreshMap()" class="refresh-map-btn" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
               <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
               Refresh Map
            </button>
          </div>
          <div id="operations-map" style="flex: 1; width: 100%; z-index: 1;"></div>
          <div *ngIf="mapLoading" class="map-loading-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #1e293b;">
             Loading Map Data...
          </div>
        </div>
 
        <!-- History Area -->
        <div *ngIf="activeTab === 'history'" class="history-page">
          <div class="section-container">
            <h2 class="section-title">
              <lucide-icon name="history" [size]="20" style="color: #10b981;"></lucide-icon>
              Completed Missions History
            </h2>
            
            <div class="task-grid" *ngIf="completedTasks.length > 0">
              <div class="task-card" *ngFor="let task of completedTasks" style="border-left-color: #10b981">
                <div class="task-info-row">
                  <span class="label">Zone:</span>
                  <span class="value">{{ task.zoneName }}</span>
                </div>
                <div class="task-info-row">
                  <span class="label">Task:</span>
                  <span class="value">{{ task.description }}</span>
                </div>
                <div class="task-info-row">
                  <span class="label">Completed:</span>
                  <span class="status-chip completed">FINISHED</span>
                </div>
                <div class="task-info-row">
                  <span class="label">Date:</span>
                  <span class="value">{{ task.assignedAt | date:'medium' }}</span>
                </div>
                
                <!-- Report Details Section -->
                <div class="report-details" *ngIf="task.reportNotes || (task.imageUrls && task.imageUrls.length > 0)" 
                     style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #cbd5e1;">
                  <div class="report-notes" style="font-size: 0.9rem; color: #475569; margin-bottom: 12px; line-height: 1.5; font-style: italic;">
                    "{{ task.reportNotes }}"
                  </div>
                  <div class="report-gallery" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <div class="report-img-thumb" *ngFor="let img of task.imageUrls" 
                         style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; cursor: pointer;"
                         (click)="openImage(img)">
                      <img [src]="img" alt="Mission evidence" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                  </div>
                </div>

                <div class="task-actions" style="border-top: none; padding-top: 0;">
                   <div class="completed-msg" style="margin-top: 12px;">
                    <lucide-icon name="check" [size]="16"></lucide-icon>
                    Mission Documented
                  </div>
                </div>
              </div>
            </div>

            <div class="no-broadcasts" style="margin-top: 20px;" *ngIf="completedTasks.length === 0">
              <lucide-icon name="history" [size]="48" style="opacity: 0.3;"></lucide-icon>
              <p>Your mission history is empty.</p>
              <span>Complete tasks to see them archived here.</span>
            </div>
          </div>
        </div>

        <!-- Profile Area -->
        <div *ngIf="activeTab === 'profile'" class="profile-page">

          <div class="profile-card" style="border: none; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); background: white; border-radius: 32px; overflow: hidden;">
            <div class="profile-card-header" style="background: #1e293b; padding: 48px; position: relative;">
               <div style="display: flex; align-items: center; gap: 32px;">
                 <div class="avatar-large" style="width: 100px; height: 100px; font-size: 2.5rem; background: #dc2626; border: 4px solid rgba(255,255,255,0.1); shadow: 0 4px 12px rgba(0,0,0,0.2);">
                   {{ (profileForm.fullName || 'R')[0].toUpperCase() }}
                 </div>
                 <div>
                   <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 4px; color: white;">{{ profileForm.fullName || 'Unnamed Responder' }}</h2>
                   <p style="color: #94a3b8; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem;">{{ profileForm.responderType }} STAFF</p>
                 </div>
               </div>
               <button class="edit-toggle-btn" (click)="toggleEdit()" *ngIf="!editMode" 
                       style="position: absolute; top: 48px; right: 48px; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; backdrop-filter: blur(8px); transition: all 0.2s;">
                 <lucide-icon name="pencil" [size]="16"></lucide-icon> Edit Profile
               </button>
            </div>
            
            <div style="padding: 40px;">
              <div class="alert-success" *ngIf="saveSuccess" style="background: #ecfdf5; color: #059669; padding: 12px 20px; border-radius: 12px; margin-bottom: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px; border: 1px solid #d1fae5;">
                <lucide-icon name="check" [size]="18"></lucide-icon> Profile updated successfully!
              </div>
              <div class="alert-error" *ngIf="saveError" style="background: #fef2f2; color: #dc2626; padding: 12px 20px; border-radius: 12px; margin-bottom: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px; border: 1px solid #fee2e2;">
                <lucide-icon name="x" [size]="18"></lucide-icon> {{ saveError }}
              </div>

              <div class="profile-fields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                <div class="field-group">
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="profileForm.fullName" class="field-input" [disabled]="!editMode" 
                         [style.background]="!editMode ? '#f8fafc' : 'white'"
                         [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="profileForm.email" class="field-input" [disabled]="!editMode"
                         [style.background]="!editMode ? '#f8fafc' : 'white'"
                         [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                  <label>Phone Number</label>
                  <input type="text" [(ngModel)]="profileForm.phone" class="field-input" [disabled]="!editMode"
                         [style.background]="!editMode ? '#f8fafc' : 'white'"
                         [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                  <label>Region / Base</label>
                  <input type="text" [(ngModel)]="profileForm.region" class="field-input" [disabled]="!editMode"
                         [style.background]="!editMode ? '#f8fafc' : 'white'"
                         [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                   <label>City</label>
                   <input type="text" [(ngModel)]="profileForm.city" class="field-input" [disabled]="!editMode"
                          [style.background]="!editMode ? '#f8fafc' : 'white'"
                          [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                   <label>State</label>
                   <input type="text" [(ngModel)]="profileForm.state" class="field-input" [disabled]="!editMode"
                          [style.background]="!editMode ? '#f8fafc' : 'white'"
                          [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                  <label>Badge Number</label>
                  <input type="text" [(ngModel)]="profileForm.badgeNumber" class="field-input" [disabled]="!editMode"
                         [style.background]="!editMode ? '#f8fafc' : 'white'"
                         [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                  <label>Service Pincode</label>
                  <input type="text" [(ngModel)]="profileForm.pincode" class="field-input" [disabled]="!editMode"
                         [style.background]="!editMode ? '#f8fafc' : 'white'"
                         [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                   <label>Base Latitude</label>
                   <input type="number" [(ngModel)]="profileForm.latitude" class="field-input" [disabled]="!editMode"
                          [style.background]="!editMode ? '#f8fafc' : 'white'"
                          [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
                <div class="field-group">
                   <label>Base Longitude</label>
                   <input type="number" [(ngModel)]="profileForm.longitude" class="field-input" [disabled]="!editMode"
                          [style.background]="!editMode ? '#f8fafc' : 'white'"
                          [style.cursor]="!editMode ? 'default' : 'text'">
                </div>
              </div>

              <div class="profile-actions" *ngIf="editMode" style="border-top: 1.5px solid #f1f5f9; padding-top: 40px; display: flex; gap: 16px;">
                <button class="btn-save" (click)="saveProfile()" [disabled]="saving">
                  <lucide-icon name="check" [size]="18" *ngIf="!saving"></lucide-icon>
                  {{ saving ? 'Updating...' : 'Save Changes' }}
                </button>
                <button class="btn-cancel" (click)="cancelEdit()" style="background: white; border: 1.5px solid #e2e8f0; color: #64748b; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer;">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- Report Modal -->
        <div class="modal-backdrop" *ngIf="showReportModal">
          <div class="modal-card">
            <div class="modal-header">
              <h3>
                <lucide-icon name="file-text" [size]="20"></lucide-icon>
                Submit Mission Report
              </h3>
              <button class="close-btn" (click)="closeReportModal()">
                <lucide-icon name="x" [size]="20"></lucide-icon>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="task-summary-box">
                <label>Active Mission</label>
                <div class="mission-desc">{{ selectedTaskForReport?.description }}</div>
              </div>

              <div class="form-group">
                <label>Mission Notes & Success Details</label>
                <textarea 
                  [(ngModel)]="reportForm.notes" 
                  placeholder="Describe the rescue outcome, people helped, and current site status..."
                  rows="4"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label>Visual Evidence (Upload Photos)</label>
                <div class="file-upload-group" style="display: flex; gap: 8px; flex-direction: column;">
                  <div class="upload-area" 
                    style="border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; background: #f8fafc; transition: all 0.2s;" 
                    (click)="fileInput.click()"
                    [style.borderColor]="isUploading ? '#2563eb' : '#e2e8f0'"
                  >
                     <lucide-icon name="upload-cloud" [size]="32" [style.color]="isUploading ? '#2563eb' : '#64748b'" style="margin-bottom: 8px;"></lucide-icon>
                     <p style="margin: 0; color: #64748b; font-size: 0.9rem;">
                       {{ isUploading ? 'Uploading Evidence...' : 'Click to upload mission photos' }}
                     </p>
                     <span style="font-size: 0.75rem; color: #94a3b8;">
                       {{ isUploading ? 'Please wait, processing files...' : 'PNG, JPG up to 5MB' }}
                     </span>
                  </div>
                  <input 
                    #fileInput
                    type="file" 
                    accept="image/*"
                    style="display: none;"
                    (change)="onFileSelected($event)"
                    multiple
                  >
                </div>
                
                <div class="image-previews" *ngIf="reportForm.imageUrls.length > 0" style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
                  <div class="preview-item" *ngFor="let url of reportForm.imageUrls; let i = index" style="position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <img [src]="url" alt="evidence" style="width: 100%; height: 100%; object-fit: cover;">
                    <button class="remove-img" (click)="removeImageUrl(i)" style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.5); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                      <lucide-icon name="x" [size]="12"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

<div class="modal-footer">
              <button class="btn-cancel" (click)="closeReportModal()">Cancel</button>
              <button 
                class="btn-save" 
                style="background: #059669;"
                [disabled]="!reportForm.notes.trim() || reportForm.imageUrls.length === 0 || submittingReport || isUploading"
                (click)="submitReport()"
              >
                {{ submittingReport ? 'Processing...' : (isUploading ? 'Waiting for Upload...' : 'Complete & Submit') }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f8fafc; color: #111827; font-family: 'Inter', sans-serif; }
    .sidebar { width: 280px; padding: 32px 20px; display: flex; flex-direction: column; background: #ffffff; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh; }
    .brand { font-size: 1.5rem; font-weight: 800; margin-bottom: 48px; color: #111827; display: flex; align-items: center; gap: 12px; }
    .brand-icon { color: #dc2626; }
    .nav-links { list-style: none; padding: 0; flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .nav-links li { padding: 12px 16px; border-radius: 12px; cursor: pointer; color: #4b5563; display: flex; align-items: center; gap: 12px; font-weight: 500; transition: all 0.3s; }
    .nav-links li:hover { background: #fef2f2; color: #dc2626; }
    .nav-links li.active { background: #dc2626; color: white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
    .connection-status { margin: 20px 0; padding: 12px 16px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 600; color: #64748b; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
    .connection-status.online { background: #ecfdf5; color: #059669; }
    .connection-status.online .status-dot { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
    .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; border: 1.5px solid #dc2626; background: transparent; color: #dc2626; cursor: pointer; font-weight: 700; margin-top: auto; }
    .logout-btn:hover { background: #dc2626; color: white; }
    .content { flex: 1; margin-left: 280px; padding: 40px; display: flex; flex-direction: column; gap: 32px; }
    header { display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 1.875rem; font-weight: 700; color: #111827; }
    .user-info { display: flex; align-items: center; gap: 16px; background: white; padding: 8px 8px 8px 20px; border-radius: 50px; border: 1px solid #e2e8f0; }
    .welcome-text { font-weight: 700; color: #111827; font-size: 0.9rem; }
    .responder-badge { background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .section-container { margin-bottom: 32px; }
    .section-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px; }
    .alert-grid { display: grid; gap: 16px; margin-bottom: 40px; }
    .alert-card { background: white; border-radius: 20px; border: 1px solid #fee2e2; padding: 24px; box-shadow: 0 2px 10px rgba(220, 38, 38, 0.05); position: relative; border-left: 6px solid #ef4444; }
    .alert-card.acked { border-left-color: #10b981; border-color: #d1fae5; opacity: 0.75; }
    .unread-dot { position: absolute; top: 16px; right: 16px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite; }
     .broadcast-count { background: #ef4444; color: white; font-size: 0.7rem; font-weight: 800; padding: 1px 6px; border-radius: 20px; margin-left: 8px; }
     .clear-btn { background: white; border: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
     .clear-btn:hover { background: #f8fafc; color: #ef4444; border-color: #fee2e2; }
     .delete-icon-btn:hover { color: #dc2626 !important; background: #fee2e2 !important; border-radius: 4px; }
     .refresh-btn-light { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
     .refresh-btn-light:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }
     .badge-dot { position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid white; }
     .severity-badge.critical { background: #fee2e2; color: #dc2626; }
     .severity-badge.high { background: #ffedd5; color: #ea580c; }
     .severity-badge.moderate { background: #fef9c3; color: #ca8a04; }
     .severity-badge.info { background: #e0f2fe; color: #0284c7; }
     .btn-ready { background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }
     .ack-badge { background: #ecfdf5; color: #059669; padding: 8px 16px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .task-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #e2e8f0; position: relative; }
    .task-info-row { display: flex; gap: 12px; margin-bottom: 10px; font-size: 0.95rem; }
    .task-info-row .label { font-weight: 800; min-width: 100px; color: #64748b; }
    .task-info-row .value { color: #1e293b; font-weight: 500; }
    .status-chip { font-size: 0.75rem; font-weight: 900; padding: 4px 12px; border-radius: 6px; text-transform: uppercase; }
    .status-chip.pending { background: #fef3c7; color: #92400e; }
    .status-chip.ongoing { background: #dbeafe; color: #1e40af; }
    .status-chip.completed { background: #d1fae5; color: #065f46; }
    .task-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; gap: 10px; }
    .btn-task { flex: 1; padding: 12px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; color: white; transition: all 0.2s; }
    .btn-task.start { background: #2563eb; }
    .btn-task.complete { background: #059669; }
    .completed-msg { display: flex; align-items: center; gap: 8px; color: #059669; font-weight: 800; }
    .no-broadcasts { background: white; border: 2px dashed #e2e8f0; border-radius: 24px; padding: 60px 40px; text-align: center; color: #94a3b8; }
    .history-page, .profile-page { display: flex; flex-direction: column; gap: 24px; max-width: 800px; }
    .history-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 20px; border: 1px solid #e2e8f0; }
    .history-icon { width: 48px; height: 48px; border-radius: 14px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; }
    .history-icon.ready { background: #ecfdf5; color: #10b981; }
    .profile-card { background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; }
    .avatar-large { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; }
    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .field-group label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .field-input { padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 0.95rem; font-weight: 600; color: #1e293b; transition: all 0.2s; }
    .field-input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); background: white !important; }
    .field-input:disabled { color: #475569; border-color: #f1f5f9; }
    .btn-save { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .btn-save:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
    .btn-save:disabled { background: #cbd5e1 !important; cursor: not-allowed; }
    @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
    @keyframes pulse-disaster { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(30, 41, 59, 0.7); } 70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(30, 41, 59, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(30, 41, 59, 0); } }
    @keyframes pulse-theme { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background: white; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 10px; }
    .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }
    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .task-summary-box { background: #f8fafc; padding: 16px; border-radius: 16px; border: 1.5px dashed #e2e8f0; }
    .task-summary-box label { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; display: block; }
    .mission-desc { font-weight: 600; color: #1e293b; line-height: 1.5; }
    .form-group label { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; display: block; }
    .form-textarea { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-family: inherit; font-size: 1rem; resize: none; outline: none; transition: border-color 0.2s; }
    .form-textarea:focus { border-color: #2563eb; }
    .modal-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; }

    .report-card { background: white; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px; }
    .report-header { display: flex; justify-content: space-between; align-items: center; }
    .task-badge { background: #dbeafe; color: #1e40af; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
    .report-date { font-size: 0.8rem; color: #64748b; font-weight: 500; }
    .report-notes { color: #334155; line-height: 1.6; font-size: 0.95rem; }
    .report-gallery { display: flex; gap: 10px; flex-wrap: wrap; }
    .report-img-wrapper { width: 100px; height: 100px; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; cursor: pointer; }
    .report-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
  `]
})
export class ResponderDashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  activeTab = 'tasks';
  editMode = false;
  saving = false;
  saveSuccess = false;
  saveError = '';

  notifications: any[] = [];
  ackHistory: any[] = [];
  acknowledgedIds: Set<number> = new Set();
  processingAck: number | null = null;

  private eventSource: EventSource | null = null;
  sseStatus: 'CONNECTING' | 'CONNECTED' | 'ERROR' = 'CONNECTING';
 
  private map: L.Map | null = null;
  mapLoading = false;
  private markers: L.Marker[] = [];

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

  rescueTasks: RescueTaskDTO[] = [];

  // Report Section State
  showReportModal = false;
  selectedTaskForReport: RescueTaskDTO | null = null;
  reportForm = {
    notes: '',
    imageUrls: [] as string[]
  };
  submittingReport = false;
  isUploading = false;
  missionReports: any[] = [];

  get pendingTasks() {
    return this.rescueTasks.filter(t => t.status === 'PENDING');
  }

  get ongoingTasks() {
    return this.rescueTasks.filter(t => t.status === 'ONGOING');
  }

  get completedTasks() {
    return this.rescueTasks.filter(t => t.status === 'COMPLETED');
  }

  get directMessages() {
    return this.notifications.filter(n => n.targetRegion === 'ADMIN_DIRECT');
  }

  get broadcastAlerts() {
    return this.notifications.filter(n => n.targetRegion !== 'ADMIN_DIRECT');
  }

  clearDirectMessages() {
    if (confirm('Clear all direct messages from Command Center?')) {
      const ids = this.directMessages.map(m => m.id);
      ids.forEach(id => {
        this.disasterService.deleteNotification(id).subscribe({
          next: () => this.notifications = this.notifications.filter(n => n.id !== id)
        });
      });
    }
  }

  clearBroadcasts() {
    if (confirm('Clear all general disaster broadcast alerts?')) {
      const ids = this.broadcastAlerts.map(m => m.id);
      ids.forEach(id => {
        this.disasterService.deleteNotification(id).subscribe({
          next: () => this.notifications = this.notifications.filter(n => n.id !== id)
        });
      });
    }
  }

  loadMissionReports() {
    this.disasterService.getMyMissionReports().subscribe({
      next: (reports) => this.missionReports = reports || [],
      error: (err) => console.error('Failed to load reports:', err)
    });
  }

  constructor(
    private authService: AuthService,
    private disasterService: DisasterService,
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.initProfileForm();
    
    // Fetch latest profile from DB to ensure all fields are populated
    const token = this.authService.getToken();
    if (token) {
      this.http.get<any>('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (userData) => {
          this.currentUser = userData;
          this.authService.updateUser(userData);
          this.initProfileForm();
        },
        error: (err) => console.error('Failed to fetch latest profile', err)
      });
    }

    this.loadInitialData();
    this.setupSseConnection();
  }

  ngOnDestroy() {
    this.closeSse();
  }
 
  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
    if (tab === 'ongoing' || tab === 'history' || tab === 'tasks') {
      this.loadRescueTasks();
    }
  }

  openReportModal(task: RescueTaskDTO) {
    this.selectedTaskForReport = task;
    this.reportForm = { notes: '', imageUrls: [] };
    this.isUploading = false;
    this.submittingReport = false;
    this.showReportModal = true;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.selectedTaskForReport = null;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.isUploading = true;
      const fileArray = Array.from(files);
      let successCount = 0;
      let processedCount = 0;

      fileArray.forEach(file => {
        this.disasterService.uploadFile(file).subscribe({
          next: (res) => {
            this.reportForm.imageUrls.push(res.url);
            successCount++;
            processedCount++;
            if (processedCount === fileArray.length) {
              this.isUploading = false;
            }
          },
          error: (err) => {
            console.error('Upload failed:', err);
            processedCount++;
            if (processedCount === fileArray.length) {
              this.isUploading = false;
            }
          }
        });
      });
      // Reset input immediately so same file can be chosen again
      event.target.value = '';
    }
  }

  removeImageUrl(index: number) {
    this.reportForm.imageUrls.splice(index, 1);
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  submitReport() {
    if (!this.selectedTaskForReport || !this.reportForm.notes.trim()) return;

    this.submittingReport = true;
    this.disasterService.submitMissionReport({
      taskId: this.selectedTaskForReport.taskId,
      notes: this.reportForm.notes,
      imageUrls: this.reportForm.imageUrls
    }).subscribe({
      next: (res) => {
        this.submittingReport = false;
        this.closeReportModal();
        this.loadRescueTasks(); // Refresh list (will show as completed)
        this.setTab('history');
      },
      error: (err) => {
        this.submittingReport = false;
        alert('Failed to submit report. Please try again.');
      }
    });
  }

  initProfileForm() {
    if (this.currentUser) {
      this.profileForm = {
        fullName: this.currentUser.fullName || '',
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || '',
        region: this.currentUser.region || '',
        city: this.currentUser.city || '',
        state: this.currentUser.state || '',
        responderType: this.currentUser.responderType || 'RESCUE_STAFF',
        badgeNumber: this.currentUser.badgeNumber || '',
        latitude: this.currentUser.latitude || null,
        longitude: this.currentUser.longitude || null,
        pincode: this.currentUser.pincode || ''
      };
    }
  }

  loadInitialData() {
    this.disasterService.getResponderNotifications().subscribe(msgs => {
      this.notifications = (msgs || [])
        .filter(n => n && n.message && n.message.trim() !== '')
        .map(n => this.normalizeAlert(n));
    });

    this.disasterService.getResponderAcks().subscribe(acks => {
      this.ackHistory = acks || [];
      this.ackHistory.forEach(a => this.acknowledgedIds.add(Number(a.disasterId)));
    });

    this.loadRescueTasks();
  }

  loadNotifications() {
    this.disasterService.getResponderNotifications().subscribe(msgs => {
      this.notifications = (msgs || [])
        .filter(n => n && n.message && n.message.trim() !== '')
        .map(n => this.normalizeAlert(n));
    });
  }

  loadRescueTasks() {
    this.disasterService.getResponderTasks().subscribe({
      next: (tasks) => {
        this.rescueTasks = tasks || [];
      },
      error: (err) => console.error('Failed to load rescue tasks:', err)
    });
  }

  normalizeAlert(n: any): any {
    const typeMatch = n.message?.match(/DISASTER ALERT:\s*([^\|]+)/i);
    const extractedType = typeMatch ? typeMatch[1].trim().toUpperCase() : null;
    
    // Check if it's an admin message
    const isAdminMsg = n.targetRegion === 'ADMIN_DIRECT' || n.message?.includes('[Control Center Message]');
    const title = n.title || (isAdminMsg ? 'Control Center Message' : (n.message ? n.message.split('|')[0].replace(/DISASTER ALERT:/i, '').trim() : 'Emergency Alert'));

    return {
      ...n,
      disasterId: n.disasterId ? Number(n.disasterId) : 0,
      disasterType: n.disasterType || extractedType || (isAdminMsg ? 'DIRECT' : 'ALERT'),
      title: title,
      message: n.message,
      targetRegion: n.targetRegion || (isAdminMsg ? 'Command Center' : 'Affected Zone'),
      isNew: false
    };
  }

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
      this.ngZone.run(() => {
        this.sseStatus = 'CONNECTED';
      });
    };

    this.eventSource.onerror = () => {
      this.ngZone.run(() => {
        this.sseStatus = 'ERROR';
        setTimeout(() => this.setupSseConnection(), 5000);
      });
    };

    // Listen for the initial handshake event from server
    this.eventSource.addEventListener('CONNECTED', () => {
      this.ngZone.run(() => {
        this.sseStatus = 'CONNECTED';
      });
    });

    this.eventSource.addEventListener('ALERT', (event: any) => {
      this.ngZone.run(() => {
        try {
          const raw = JSON.parse(event.data);
          const normalized = this.normalizeAlert({ ...raw, isNew: true });
          
          // Check if it already exists by ID
          const exists = this.notifications.find(n => n.id === normalized.id);
          if (!exists) {
            this.notifications.unshift(normalized);
            console.log('New Command Message or Alert received:', normalized);
          }
        } catch (e) { }
      });
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

  clearAlerts() {
    this.notifications = [];
  }

  deleteNotification(id: number) {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    this.disasterService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      },
      error: (err) => alert('Failed to delete notification')
    });
  }

  clearAllNotifications() {
    if (!confirm('This will permanently delete ALL your notifications. Continue?')) return;
    this.disasterService.clearAllNotifications().subscribe({
      next: () => {
        this.notifications = [];
      },
      error: (err) => alert('Failed to clear notifications')
    });
  }

  // --- MAP LOGIC ---
  private initMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map('operations-map').setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.loadActiveTasksForMap();
  }

  refreshMap() {
    this.loadActiveTasksForMap();
  }

  private lines: L.Polyline[] = [];

  private loadActiveTasksForMap() {
    this.mapLoading = true;
    
    // 1. Fetch both tasks and disasters in parallel (or nested for simplicity)
    this.disasterService.getAllDisasters().subscribe({
      next: (disasters) => {
        const verifiedDisasters = disasters.filter(d => d.status === 'VERIFIED');
        
        this.disasterService.getActiveRescueTasks().subscribe({
          next: (tasks) => {
            this.clearMapElements();
            
            // 2. Add Base Marker (Responder's home station)
            if (this.currentUser?.latitude && this.currentUser?.longitude && this.map) {
               const baseIcon = L.divIcon({
                 className: 'base-marker',
                 html: `<div style="background: #1e293b; color: white; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: 800; font-size: 0.6rem;">HQ</div>`,
                 iconSize: [30, 30],
                 iconAnchor: [15, 15]
               });
               const baseMarker = L.marker([this.currentUser.latitude, this.currentUser.longitude], { icon: baseIcon })
                 .bindPopup('<b style="color: #1e293b;">Command Center / Base</b><br>Your headquarters.')
                 .addTo(this.map);
               this.markers.push(baseMarker);
            }

            // 3. Add Disaster Hubs (Disasters themselves) - Updated to the Header Slate-Blue Theme
            verifiedDisasters.forEach(d => {
              if (d.latitude && d.longitude && this.map) {
                const disasterIcon = L.divIcon({
                  className: 'disaster-hub',
                  html: `<div style="background: #1e293b; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(30, 41, 59, 0.5); animation: pulse-disaster 1.5s infinite alternate; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 800;">!</div>`,
                  iconSize: [26, 26],
                  iconAnchor: [13, 13]
                });
                const dMarker = L.marker([d.latitude, d.longitude], { icon: disasterIcon })
                  .bindPopup(`<b style="color: #1e293b;">INCIDENT Source: ${d.title}</b><br>${d.description}`)
                  .addTo(this.map);
                this.markers.push(dMarker);
              }
            });

            // 4. Add Tasks and Connect them to Disasters with lines
            tasks.forEach(task => {
              this.addMarkerForTask(task);
              
              // Find the disaster this task belongs to for drawing a line
              const parentDisaster = verifiedDisasters.find(d => d.id === task.disasterId);
              if (parentDisaster && parentDisaster.latitude && parentDisaster.longitude && this.map) {
                const polyline = L.polyline(
                  [[parentDisaster.latitude, parentDisaster.longitude], [task.latitude, task.longitude]],
                  { color: '#1e293b', weight: 3, opacity: 0.5, dashArray: '8, 8', lineJoin: 'round' }
                ).addTo(this.map);
                
                // Add a matching glow line
                L.polyline(
                   [[parentDisaster.latitude, parentDisaster.longitude], [task.latitude, task.longitude]],
                   { color: '#3b82f6', weight: 1, opacity: 0.3 }
                ).addTo(this.map);
                
                this.lines.push(polyline);
              }
            });

            this.mapLoading = false;
            
            // Fit map to markers if any
            if (this.markers.length > 0 && this.map) {
              const group = L.featureGroup(this.markers);
              this.map.fitBounds(group.getBounds().pad(0.1));
            }
          },
          error: (err) => {
            console.error('Failed to load tasks for map:', err);
            this.mapLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load disasters for map:', err);
        this.mapLoading = false;
      }
    });
  }

  private clearMapElements() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.lines.forEach(l => l.remove());
    this.lines = [];
  }

  private addMarkerForTask(task: any) {
    if (!task.latitude || !task.longitude || !this.map) return;

    let markerColor = '#eab308'; // Default Yellow for PENDING
    if (task.status === 'ONGOING') markerColor = '#3b82f6'; // Blue
    if (task.status === 'COMPLETED') markerColor = '#22c55e'; // Green

    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([task.latitude, task.longitude], { icon })
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 5px;">
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">Zone: ${task.zoneName}</h3>
          <p style="margin: 4px 0; font-size: 0.8rem; color: #4b5563;"><strong>Task:</strong> ${task.description}</p>
          <p style="margin: 4px 0; font-size: 0.8rem; color: #4b5563;"><strong>Responder:</strong> ${task.responderName || 'Unassigned'}</p>
          <p style="margin: 4px 0; font-size: 0.8rem; color: #4b5563;"><strong>Status:</strong> <span style="font-weight: 800; color: ${markerColor}">${task.status}</span></p>
          <p style="margin: 4px 0; font-size: 0.7rem; color: #94a3b8; font-style: italic;">Assigned: ${new Date(task.assignedAt).toLocaleString()}</p>
        </div>
      `)
      .addTo(this.map);

    this.markers.push(marker);
  }

  updateRescueStatus(taskId: number, status: string) {
    this.disasterService.updateRescueTaskStatus(taskId, status).subscribe({
      next: () => {
        this.loadRescueTasks();
        if (status === 'ONGOING') {
          this.setTab('ongoing');
        }
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        const detail = err?.error?.message || err?.statusText || 'Unknown error';
        alert(`Could not update task status: ${detail}. Please try again.`);
      }
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
    this.initProfileForm();
  }

  saveProfile() {
    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    this.disasterService.updateProfile(this.profileForm).subscribe({
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
}
