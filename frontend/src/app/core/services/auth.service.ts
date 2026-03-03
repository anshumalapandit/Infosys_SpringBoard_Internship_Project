import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/v1/auth';
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                this.currentUserSubject.next(JSON.parse(savedUser));
            } catch (e) {
                console.error('Error parsing saved user', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/authenticate`, credentials).pipe(
            tap((res: any) => this.setSession(res))
        );
    }

    private setSession(authResponse: any) {
        if (authResponse && authResponse.token) {
            localStorage.setItem('token', authResponse.token);
            localStorage.setItem('user', JSON.stringify(authResponse));
            this.currentUserSubject.next(authResponse);
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        window.location.href = '/auth/login';
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getRole(): string | null {
        const user = this.currentUserSubject.value;
        return user ? user.role : null;
    }

    getCurrentUser() {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    updateUser(user: any) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }
}
