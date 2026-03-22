import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AnalyticsService, 
  DisasterMonthlyStats, 
  RegionEfficiency, 
  ResponderPerformance, 
  NotificationInsight,
  HighRiskArea,
  AnalyticsFilter
} from '../../../core/services/analytics.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="analytics-wrapper">
      <!-- Top Actions & Filters -->
      <section class="filters-bar">
        <div class="filter-group">
          <lucide-icon name="filter" [size]="18"></lucide-icon>
          <span class="filter-label">Filters:</span>
          
          <div class="input-with-icon">
            <lucide-icon name="calendar" [size]="14"></lucide-icon>
            <input type="date" [(ngModel)]="filters.startDate" (change)="applyFilters()" placeholder="Start Date">
          </div>
          
          <div class="input-with-icon">
            <lucide-icon name="calendar" [size]="14"></lucide-icon>
            <input type="date" [(ngModel)]="filters.endDate" (change)="applyFilters()" placeholder="End Date">
          </div>

          <select [(ngModel)]="filters.region" (change)="applyFilters()">
            <option value="">All Regions</option>
            <option *ngFor="let r of uniqueRegions" [value]="r">{{r}}</option>
          </select>

          <select [(ngModel)]="filters.disasterType" (change)="applyFilters()">
            <option value="">All Types</option>
            <option value="FLOOD">Flood</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="FIRE">Fire</option>
            <option value="STORM">Storm</option>
            <option value="OTHER">Other</option>
          </select>

          <button class="reset-btn" (click)="resetFilters()">
            <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
            Reset
          </button>
        </div>

        <div class="last-updated" *ngIf="lastUpdated">
          Last updated: {{ lastUpdated | date:'shortTime' }}
        </div>
      </section>

      <!-- Summary Cards -->
      <div class="summary-grid" *ngIf="notificationInsight">
        <div class="summary-card">
          <div class="card-icon blue"><lucide-icon name="megaphone"></lucide-icon></div>
          <div class="card-content">
            <span class="card-label">Alerts Broadcasted</span>
            <span class="card-value">{{ notificationInsight.totalBroadcasted }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon green"><lucide-icon name="circle-check"></lucide-icon></div>
          <div class="card-content">
            <span class="card-label">Acknowledged</span>
            <span class="card-value">{{ notificationInsight.totalAcknowledged }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon purple"><lucide-icon name="trending-up"></lucide-icon></div>
          <div class="card-content">
            <span class="card-label">Engagement Rate</span>
            <span class="card-value">{{ notificationInsight.acknowledgmentRate | number:'1.1-1' }}%</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon orange"><lucide-icon name="activity"></lucide-icon></div>
          <div class="card-content">
            <span class="card-label">Total Disasters</span>
            <span class="card-value">{{ totalDisasters }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-stats-grid">
        <!-- Disaster Frequency -->
        <div class="content-card chart-container full-width">
          <div class="card-header">
            <h3>Disaster Frequency over Time</h3>
            <div class="header-actions">
              <span class="badge">Monthly Data</span>
            </div>
          </div>
          <div class="bar-chart-wrapper">
             <div class="y-axis-labels">
               <span>{{ maxDisasterCount }}</span>
               <span>{{ maxDisasterCount / 2 | number:'1.0-0' }}</span>
               <span>0</span>
             </div>
             <div class="bars-area">
               <div class="bar-group" *ngFor="let stat of disasterStats">
                 <div class="bar-fill" [style.height.%]="(stat.count / maxDisasterCount) * 100">
                    <div class="tooltip">{{ stat.count }} Disasters</div>
                 </div>
                 <span class="bar-label">{{ stat.period }}</span>
               </div>
               <div class="empty-chart" *ngIf="disasterStats.length === 0">
                 No data available for this period.
               </div>
             </div>
          </div>
        </div>

        <!-- Notification Depth -->
        <div class="content-card">
          <div class="card-header">
             <h3>Notification Insights</h3>
          </div>
          <div class="notification-viz" *ngIf="notificationInsight">
             <div class="dual-progress">
                <div class="progress-item">
                   <div class="p-header">
                      <span>Acknowledged</span>
                      <span>{{ notificationInsight.acknowledgmentRate | number:'1.1-1' }}%</span>
                   </div>
                   <div class="p-bar"><div class="p-fill" [style.width.%]="notificationInsight.acknowledgmentRate"></div></div>
                </div>
                <div class="progress-item">
                   <div class="p-header">
                      <span>Ignored</span>
                      <span>{{ notificationInsight.ignoredRate | number:'1.1-1' }}%</span>
                   </div>
                   <div class="p-bar grey"><div class="p-fill red" [style.width.%]="notificationInsight.ignoredRate"></div></div>
                </div>
             </div>
             <div class="total-stats">
                <div class="t-stat">
                   <strong>{{ notificationInsight.totalAcknowledged }}</strong>
                   <small>Total Acks</small>
                </div>
                <div class="t-stat">
                   <strong>{{ notificationInsight.totalIgnored }}</strong>
                   <small>Total Ignored</small>
                </div>
             </div>
          </div>
        </div>

        <!-- High Risk Areas -->
        <div class="content-card">
          <div class="card-header">
            <h3>High Risk Areas</h3>
          </div>
          <div class="high-risk-list">
             <div class="risk-item" *ngFor="let area of highRiskAreas; let i = index">
                <div class="risk-rank">{{ i + 1 }}</div>
                <div class="risk-info">
                   <span class="area-name">{{ area.location }}</span>
                   <span class="area-count">{{ area.disasterCount }} incidents</span>
                </div>
                <span class="risk-badge" [class]="area.riskLevel.toLowerCase()">{{ area.riskLevel }}</span>
             </div>
             <div class="empty-state" *ngIf="highRiskAreas.length === 0">No high risk areas identified.</div>
          </div>
        </div>

        <!-- Regional Efficiency -->
        <div class="content-card full-width">
           <div class="card-header">
              <h3>Regional Response Efficiency</h3>
           </div>
           <div class="table-wrapper">
              <table>
                 <thead>
                    <tr>
                       <th>Region</th>
                       <th>Handled</th>
                       <th>Avg Response Time</th>
                       <th>Efficiency</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr *ngFor="let region of regionEfficiency">
                       <td><strong>{{ region.region }}</strong></td>
                       <td>{{ region.handledCount }}</td>
                       <td>{{ region.avgResponseTimeHours | number:'1.1-1' }} hours</td>
                       <td>
                          <span class="status-badge" [class.excellent]="region.avgResponseTimeHours < 12" [class.good]="region.avgResponseTimeHours >= 12 && region.avgResponseTimeHours < 24" [class.slow]="region.avgResponseTimeHours >= 24">
                             {{ region.avgResponseTimeHours < 24 ? (region.avgResponseTimeHours < 12 ? 'Excellent' : 'Good') : 'Slow' }}
                          </span>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <!-- Responder Performance -->
        <div class="content-card full-width">
           <div class="card-header">
              <h3>Responder Performance Ranking</h3>
           </div>
           <div class="table-wrapper">
              <table>
                 <thead>
                    <tr>
                       <th>Responder</th>
                       <th>Tasks Assigned</th>
                       <th>Completed</th>
                       <th style="width: 300px;">Success Rate</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr *ngFor="let responder of responderPerformance">
                       <td>
                          <div class="responder-cell">
                             <div class="avatar-small">{{ responder.responderName[0] }}</div>
                             <span>{{ responder.responderName }}</span>
                          </div>
                       </td>
                       <td>{{ responder.tasksAssigned }}</td>
                       <td>{{ responder.tasksCompleted }}</td>
                       <td>
                          <div class="rate-bar-container">
                             <div class="rate-bar">
                                <div class="rate-fill" [style.width.%]="responder.completionRate" [class.low]="responder.completionRate < 50" [class.medium]="responder.completionRate >= 50 && responder.completionRate < 80" [class.high]="responder.completionRate >= 80"></div>
                             </div>
                             <span class="rate-text">{{ responder.completionRate | number:'1.0-0' }}%</span>
                          </div>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-wrapper { padding: 1.5rem; background: #f8fafc; min-height: 100%; font-family: 'Inter', sans-serif; }
    
    /* Filters Bar */
    .filters-bar { background: white; padding: 1rem 1.5rem; border-radius: 12px; display: flex; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .filter-group { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-label { font-weight: 600; color: #64748b; font-size: 0.875rem; }
    .input-with-icon { position: relative; }
    .input-with-icon lucide-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .input-with-icon input { padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; color: #1e293b; outline: none; }
    select { padding: 0.5rem 2rem 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; color: #1e293b; background: white; outline: none; cursor: pointer; }
    .reset-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; color: #ef4444; background: #fee2e2; border: none; border-radius: 6px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .reset-btn:hover { background: #fecaca; }
    .last-updated { font-size: 0.75rem; color: #94a3b8; font-style: italic; }

    /* Summary Cards */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .summary-card { background: white; padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); transition: transform 0.2s; }
    .summary-card:hover { transform: translateY(-2px); }
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
    .card-icon.blue { background: #3b82f6; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
    .card-icon.green { background: #10b981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
    .card-icon.purple { background: #8b5cf6; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3); }
    .card-icon.orange { background: #f59e0b; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
    .card-content { display: flex; flex-direction: column; }
    .card-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
    .card-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }

    /* Main Grid & Content Cards */
    .main-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .content-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; }
    .full-width { grid-column: span 2; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .card-header h3 { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0; }
    .badge { background: #f1f5f9; color: #475569; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }

    /* Bar Chart Custom Styles */
    .bar-chart-wrapper { display: flex; height: 260px; padding-top: 1rem; gap: 1rem; }
    .y-axis-labels { display: flex; flex-direction: column; justify-content: space-between; color: #94a3b8; font-size: 0.75rem; padding-bottom: 2rem; }
    .bars-area { flex: 1; border-bottom: 2px solid #f1f5f9; border-left: 2px solid #f1f5f9; display: flex; align-items: flex-end; justify-content: space-around; padding: 0 1rem; position: relative; }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; max-width: 60px; }
    .bar-fill { width: 70%; background: linear-gradient(to top, #3b82f6, #60a5fa); border-radius: 6px 6px 0 0; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); min-height: 4px; }
    .bar-fill:hover { background: #2563eb; transform: scaleX(1.1); }
    .bar-fill:hover .tooltip { opacity: 1; visibility: visible; }
    .tooltip { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity 0.2s; z-index: 10; shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .tooltip::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); border-width: 4px 4px 0 4px; border-style: solid; border-color: #1e293b transparent transparent transparent; }
    .bar-label { font-size: 0.7rem; color: #94a3b8; margin-top: 8px; font-weight: 500; height: 12px; transform: rotate(-45deg); display: block; white-space: nowrap; }
    .empty-chart { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #94a3b8; font-style: italic; }

    /* Notification Viz */
    .notification-viz { padding: 1rem 0; }
    .dual-progress { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
    .progress-item { display: flex; flex-direction: column; gap: 0.5rem; }
    .p-header { display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 600; color: #475569; }
    .p-bar { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
    .p-fill { height: 100%; background: #10b981; border-radius: 5px; }
    .p-fill.red { background: #ef4444; }
    .total-stats { display: flex; gap: 2rem; }
    .t-stat { display: flex; flex-direction: column; }
    .t-stat strong { font-size: 1.25rem; color: #1e293b; }
    .t-stat small { color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }

    /* High Risk List */
    .high-risk-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .risk-item { display: flex; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 12px; gap: 1rem; border: 1px solid transparent; transition: border 0.2s; }
    .risk-item:hover { border-color: #e2e8f0; }
    .risk-rank { width: 28px; height: 28px; background: #1e293b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
    .risk-info { flex: 1; display: flex; flex-direction: column; }
    .area-name { font-weight: 600; color: #1e293b; }
    .area-count { font-size: 0.8125rem; color: #64748b; }
    .risk-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.02em; }
    .risk-badge.high { background: #fee2e2; color: #ef4444; }
    .risk-badge.medium { background: #fef3c7; color: #f59e0b; }
    .risk-badge.low { background: #dcfce7; color: #10b981; }

    /* Tables */
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; border-bottom: 2px solid #f8fafc; }
    td { padding: 1rem; font-size: 0.9375rem; color: #334155; border-bottom: 1px solid #f8fafc; }
    .status-badge { padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.excellent { background: #dcfce7; color: #10b981; }
    .status-badge.good { background: #eff6ff; color: #3b82f6; }
    .status-badge.slow { background: #fee2e2; color: #ef4444; }

    /* Responder Specifics */
    .responder-cell { display: flex; align-items: center; gap: 0.75rem; }
    .avatar-small { width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #475569; font-size: 0.8125rem; }
    .rate-bar-container { display: flex; align-items: center; gap: 1rem; }
    .rate-bar { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .rate-fill { height: 100%; border-radius: 4px; }
    .rate-fill.high { background: #10b981; }
    .rate-fill.medium { background: #f59e0b; }
    .rate-fill.low { background: #ef4444; }
    .rate-text { font-size: 0.875rem; font-weight: 700; color: #1e293b; min-width: 45px; }

    @media (max-width: 1024px) {
       .main-stats-grid { grid-template-columns: 1fr; }
       .full-width { grid-column: auto; }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  disasterStats: DisasterMonthlyStats[] = [];
  regionEfficiency: RegionEfficiency[] = [];
  responderPerformance: ResponderPerformance[] = [];
  notificationInsight?: NotificationInsight;
  highRiskAreas: HighRiskArea[] = [];
  
  filters: AnalyticsFilter = {
    startDate: '',
    endDate: '',
    region: '',
    disasterType: ''
  };

  maxDisasterCount: number = 0;
  totalDisasters: number = 0;
  uniqueRegions: string[] = [];
  lastUpdated?: Date;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.analyticsService.getDisasterStats(this.filters).subscribe(data => {
      this.disasterStats = data;
      this.maxDisasterCount = Math.max(...data.map(d => d.count), 5);
      this.totalDisasters = data.reduce((sum, d) => sum + d.count, 0);
    });

    this.analyticsService.getRegionEfficiency(this.filters).subscribe(data => {
       this.regionEfficiency = data;
       this.uniqueRegions = Array.from(new Set(data.map(r => r.region)));
    });

    this.analyticsService.getResponderPerformance(this.filters).subscribe(data => {
      this.responderPerformance = data;
    });

    this.analyticsService.getNotificationInsights(this.filters).subscribe(data => {
      this.notificationInsight = data;
    });

    this.analyticsService.getHighRiskAreas(this.filters).subscribe(data => {
       this.highRiskAreas = data;
    });

    this.lastUpdated = new Date();
  }

  applyFilters(): void {
    this.loadData();
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      region: '',
      disasterType: ''
    };
    this.loadData();
  }
}

