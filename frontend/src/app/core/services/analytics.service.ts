import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DisasterMonthlyStats {
  period: string;
  count: number;
}

export interface RegionEfficiency {
  region: string;
  handledCount: number;
  avgResponseTimeHours: number;
}

export interface ResponderPerformance {
  responderName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
}

export interface NotificationInsight {
  totalBroadcasted: number;
  totalAcknowledged: number;
  totalIgnored: number;
  acknowledgmentRate: number;
  ignoredRate: number;
  engagementRate: number;
}

export interface HighRiskArea {
  location: string;
  disasterCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  region?: string;
  disasterType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api/admin/analytics';

  constructor(private http: HttpClient) {}

  private getParams(filter?: AnalyticsFilter): HttpParams {
    let params = new HttpParams();
    if (filter) {
      if (filter.startDate) params = params.set('start', filter.startDate);
      if (filter.endDate) params = params.set('end', filter.endDate);
      if (filter.region) params = params.set('region', filter.region);
      if (filter.disasterType) params = params.set('disasterType', filter.disasterType);
    }
    return params;
  }

  getDisasterStats(filter?: AnalyticsFilter): Observable<DisasterMonthlyStats[]> {
    return this.http.get<DisasterMonthlyStats[]>(`${this.apiUrl}/disasters`, { params: this.getParams(filter) });
  }

  getRegionEfficiency(filter?: AnalyticsFilter): Observable<RegionEfficiency[]> {
    return this.http.get<RegionEfficiency[]>(`${this.apiUrl}/regions`, { params: this.getParams(filter) });
  }

  getResponderPerformance(filter?: AnalyticsFilter): Observable<ResponderPerformance[]> {
    return this.http.get<ResponderPerformance[]>(`${this.apiUrl}/responders`, { params: this.getParams(filter) });
  }

  getNotificationInsights(filter?: AnalyticsFilter): Observable<NotificationInsight> {
    return this.http.get<NotificationInsight>(`${this.apiUrl}/notifications`, { params: this.getParams(filter) });
  }

  getHighRiskAreas(filter?: AnalyticsFilter): Observable<HighRiskArea[]> {
    return this.http.get<HighRiskArea[]>(`${this.apiUrl}/high-risk-areas`, { params: this.getParams(filter) });
  }
}

