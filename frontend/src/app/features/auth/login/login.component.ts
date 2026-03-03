import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

import {
    LucideAngularModule,
    Siren,
    ArrowLeft
} from 'lucide-angular';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    credentials = { username: '', password: '' };
    error = '';
    loading = false;
    successMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['registered'] === 'true') {
                this.successMessage = 'Registration successful! Please sign in with your new account.';
            }
        });
    }

    onSubmit() {
        if (this.loading) return;

        if (!this.credentials.username || !this.credentials.password) {
            this.error = 'Please enter both username and password.';
            return;
        }

        this.loading = true;
        this.error = '';
        this.successMessage = '';

        console.log('--- LOGIN ATTEMPT START ---');
        console.log('User:', this.credentials.username);

        this.authService.login(this.credentials)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    console.log('--- LOGIN REQUEST FINISHED ---');
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: (res) => {
                    console.log('Login Success:', res);
                    const route = res.role === 'ROLE_ADMIN' ? '/admin' :
                        res.role === 'ROLE_RESPONDER' ? '/responder' : '/user';
                    this.router.navigate([route + '/dashboard']);
                },
                error: (err) => {
                    console.error('Login Error Object:', err);
                    if (err.status === 403 || err.status === 401) {
                        this.error = 'Invalid credentials. Please enter correct username or password.';
                    } else if (err.status === 0) {
                        this.error = 'Server is unreachable. Please check your connection.';
                    } else {
                        // Display the actual error message from backend if available
                        this.error = err.error?.message || 'Authentication failed. Please try again.';
                    }
                    console.log('UI Error Set:', this.error);
                }
            });
    }
}
