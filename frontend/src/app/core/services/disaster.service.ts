import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DisasterEvent {
    id?: number;
    title: string;
    description: string;
    disasterType: string;
    severity: string;
    latitude: number;
    longitude: number;
    locationName: string;
    source: string;
    eventTime: string;
    status: string;
    broadcastAlertSent?: boolean;
    createdAt?: string;
}

export interface DashboardStats {
    activeDisasters: number;
    criticalAlerts: number;
    pendingReviews: number;
    activeResponders: number;
}

export interface BroadcastResult {
    disasterId: number;
    disasterTitle: string;
    notificationsSent: number;
    targetRegion: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class DisasterService {
    private apiUrl = 'http://localhost:8080/api/disasters';
    private adminUrl = 'http://localhost:8080/api/admin';
    private alertsUrl = 'http://localhost:8080/api/admin/alerts';
    private responderUrl = 'http://localhost:8080/api/responder';

    constructor(private http: HttpClient) { }

    getAllDisasters(): Observable<DisasterEvent[]> {
        return this.http.get<DisasterEvent[]>(this.apiUrl);
    }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.adminUrl}/dashboard/stats`);
    }

    getPendingDisasters(): Observable<DisasterEvent[]> {
        return this.http.get<DisasterEvent[]>(`${this.adminUrl}/disasters/pending`);
    }

    approveDisaster(id: number): Observable<DisasterEvent> {
        return this.http.put<DisasterEvent>(`${this.adminUrl}/disasters/${id}/approve`, {});
    }

    rejectDisaster(id: number): Observable<DisasterEvent> {
        return this.http.put<DisasterEvent>(`${this.adminUrl}/disasters/${id}/reject`, {});
    }

    /**
     * NEW: calls POST /api/admin/alerts/broadcast
     * Validates VERIFIED status server-side, saves per-user Notification rows,
     * pushes SSE events, and returns a summary.
     */
    broadcastAlert(disasterId: number, targetRegion?: string, customMessage?: string): Observable<BroadcastResult> {
        const body: any = { disasterId };
        if (targetRegion && targetRegion.trim()) body.targetRegion = targetRegion.trim();
        if (customMessage && customMessage.trim()) body.customMessage = customMessage.trim();
        return this.http.post<BroadcastResult>(`${this.alertsUrl}/broadcast`, body);
    }

    /** Fetch all notifications sent for a disaster (admin audit) */
    getBroadcastNotifications(disasterId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.alertsUrl}/disaster/${disasterId}`);
    }

    revokeBroadcast(id: number): Observable<DisasterEvent> {
        return this.http.put<DisasterEvent>(`${this.adminUrl}/disasters/${id}/revoke-broadcast`, {});
    }

    createDisaster(event: DisasterEvent): Observable<DisasterEvent> {
        return this.http.post<DisasterEvent>(`${this.adminUrl}/disasters`, event);
    }

    getResponders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.adminUrl}/dashboard/responders`);
    }

    deleteDisaster(id: number): Observable<void> {
        return this.http.delete<void>(`${this.adminUrl}/disasters/${id}`);
    }

    resolveDisaster(id: number): Observable<DisasterEvent> {
        return this.http.put<DisasterEvent>(`${this.adminUrl}/disasters/${id}/resolve`, {});
    }

    deleteAllBroadcasted(): Observable<void> {
        return this.http.delete<void>(`${this.adminUrl}/disasters/broadcasted`);
    }

    /** Citizen: get my notification inbox */
    getMyNotifications(): Observable<any[]> {
        return this.http.get<any[]>('http://localhost:8080/api/citizen/notifications');
    }

    /** Citizen: get unread count */
    getUnreadCount(): Observable<{ unreadCount: number }> {
        return this.http.get<{ unreadCount: number }>('http://localhost:8080/api/citizen/notifications/unread-count');
    }

    /** Citizen: mark notification as read */
    markNotificationRead(id: number): Observable<any> {
        return this.http.patch<any>(`http://localhost:8080/api/citizen/notifications/${id}/read`, {});
    }

    /** Responder: get my notification inbox */
    getResponderNotifications(): Observable<any[]> {
        return this.http.get<any[]>(`${this.responderUrl}/alerts/my-notifications`);
    }

    /** Responder: acknowledge an alert */
    acknowledgeAlert(disasterId: number, readinessStatus: string, notes?: string): Observable<any> {
        return this.http.post<any>(`${this.responderUrl}/alerts/${disasterId}/acknowledge`, {
            readinessStatus,
            notes
        });
    }

    /** Responder: get my acknowledgment history */
    getResponderAcks(): Observable<any[]> {
        return this.http.get<any[]>(`${this.responderUrl}/alerts/my-acks`);
    }

    /**
     * Citizen: submit an emergency incident report (wired to real backend).
     * POST /api/citizen/help-request
     */
    submitIncidentReport(payload: {
        description: string;
        latitude: number;
        longitude: number;
        locationLabel?: string;
        emergencyType?: string;
    }): Observable<any> {
        return this.http.post<any>('http://localhost:8080/api/citizen/help-request', payload);
    }

    /** Admin: get all citizen help requests */
    getAdminHelpRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.adminUrl}/dashboard/help-requests`);
    }

    /** Responder: accept a PENDING help request → moves to ASSIGNED */
    acceptHelpRequest(id: number): Observable<any> {
        return this.http.post<any>(`${this.responderUrl}/help-requests/${id}/accept`, {});
    }

    /** Responder: complete an ASSIGNED help request */
    completeHelpRequest(id: number): Observable<any> {
        return this.http.post<any>(`${this.responderUrl}/help-requests/${id}/complete`, {});
    }
}

