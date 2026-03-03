import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import {
  LucideAngularModule,
  Siren,
  User,
  Activity,
  ShieldCheck,
  MapPin,
  CircleAlert,
  ArrowLeft
} from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="register-page">
      <div class="form-section full-width">
        <div class="form-container">
          <a routerLink="/" class="back-link">
            <lucide-icon name="arrow-left" [size]="16" class="back-arrow"></lucide-icon> Back to Home
          </a>

          <div class="header">
            <div class="logo">
              <lucide-icon name="siren" [size]="28" class="logo-icon"></lucide-icon>
              Sentinel
            </div>
            <h1>Create Account</h1>
            <p class="subtitle">Join our disaster management platform and help save lives</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="register-form" #regForm="ngForm">
            <div class="role-selection">
              <label class="section-label">Select Your Role</label>
              <div class="role-grid">
                <div 
                  class="role-card" 
                  [class.active]="form.role === 'ROLE_CITIZEN'"
                  (click)="setRole('ROLE_CITIZEN')"
                >
                  <lucide-icon name="user" [size]="32" class="role-lucide-icon"></lucide-icon>
                  <span class="role-name">Citizen</span>
                </div>
                <div 
                  class="role-card" 
                  [class.active]="form.role === 'ROLE_RESPONDER'"
                  (click)="setRole('ROLE_RESPONDER')"
                >
                  <lucide-icon name="activity" [size]="32" class="role-lucide-icon"></lucide-icon>
                  <span class="role-name">Responder</span>
                </div>
                <div 
                  class="role-card" 
                  [class.active]="form.role === 'ROLE_ADMIN'"
                  (click)="setRole('ROLE_ADMIN')"
                >
                  <lucide-icon name="shield-check" [size]="32" class="role-lucide-icon"></lucide-icon>
                  <span class="role-name">Admin</span>
                </div>
              </div>
            </div>

            <div class="form-grid">
                <div class="form-row">
                  <div class="form-group">
                    <label for="fullName">Full Name</label>
                    <input 
                      type="text" 
                      id="fullName"
                      name="fullName"
                      [(ngModel)]="form.fullName" 
                      class="form-input"
                      placeholder="John Doe"
                      required
                      #fullName="ngModel"
                    >
                  </div>
                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      [(ngModel)]="form.email" 
                      class="form-input"
                      placeholder="john@example.com"
                      required
                      #email="ngModel"
                    >
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                      type="text" 
                      id="username"
                      name="username"
                      [(ngModel)]="form.username" 
                      class="form-input"
                      placeholder="johndoe"
                      required
                      #username="ngModel"
                    >
                  </div>
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      [(ngModel)]="form.phone" 
                      class="form-input"
                      placeholder="+1 234 567 8900"
                      required
                    >
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                      type="password" 
                      id="password"
                      name="password"
                      [(ngModel)]="form.password" 
                      class="form-input"
                      placeholder="Strong password"
                      required
                      #password="ngModel"
                    >
                  </div>
                  <div class="form-group"></div>
                </div>

                <div class="full-column section-divider">
                  <span class="section-label-with-icon">
                    <lucide-icon name="map-pin" [size]="18"></lucide-icon>
                    Location Information
                  </span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="region">Region/District</label>
                    <input 
                      type="text" 
                      id="region"
                      name="region"
                      [(ngModel)]="form.region" 
                      class="form-input"
                      placeholder="Enter region"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="city">City</label>
                    <input 
                      type="text" 
                      id="city"
                      name="city"
                      [(ngModel)]="form.city" 
                      class="form-input"
                      placeholder="Enter city"
                      required
                    >
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="state">State/Province</label>
                    <input 
                      type="text" 
                      id="state"
                      name="state"
                      [(ngModel)]="form.state" 
                      class="form-input"
                      placeholder="Enter state"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="pincode">Postal Code</label>
                    <input 
                      type="text" 
                      id="pincode"
                      name="pincode"
                      [(ngModel)]="form.pincode" 
                      class="form-input"
                      placeholder="123456"
                      required
                    >
                  </div>
                </div>

                <div *ngIf="form.role === 'ROLE_RESPONDER'" class="full-column conditional-section">
                  <div class="section-divider">
                    <span class="section-label-with-icon">
                      <lucide-icon name="activity" [size]="18"></lucide-icon>
                      Responder Information
                    </span>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="responderType">Responder Type</label>
                      <select 
                        id="responderType"
                        name="responderType"
                        [(ngModel)]="form.responderType" 
                        class="form-input"
                      >
                        <option value="">Select type</option>
                        <option value="POLICE"> Police</option>
                        <option value="FIRE"> Fire Department</option>
                        <option value="MEDICAL">Medical Services</option>
                        <option value="RESCUE">Search & Rescue</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="badgeNumber">Badge Number</label>
                      <input 
                        type="text" 
                        id="badgeNumber"
                        name="badgeNumber"
                        [(ngModel)]="form.badgeNumber" 
                        class="form-input"
                        placeholder="Enter badge number"
                      >
                    </div>
                  </div>
                </div>

                <div *ngIf="form.role === 'ROLE_ADMIN'" class="full-column conditional-section">
                  <div class="section-divider">
                    <span class="section-label-with-icon">
                      <lucide-icon name="shield-check" [size]="18"></lucide-icon>
                      Admin Verification
                    </span>
                  </div>
                  <div class="form-group">
                    <label for="accessCode">Department Access Code</label>
                    <input 
                      type="password" 
                      id="accessCode"
                      name="accessCode"
                      [(ngModel)]="form.accessCode" 
                      class="form-input"
                      placeholder="Enter admin access code"
                    >
                  </div>
                </div>
            </div>

            <div *ngIf="error" class="error-message">
              <lucide-icon name="circle-alert" [size]="18" class="error-lucide-icon"></lucide-icon>
              {{ error }}
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading || !regForm.form.valid">
              <span *ngIf="!loading">Create Account</span>
              <span *ngIf="loading" class="loading-text">
                <span class="spinner"></span> Creating account...
              </span>
            </button>

            <div class="form-footer">
              <p>Already have an account? <a routerLink="/auth/login" class="link">Sign In</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page { display: flex; min-height: 100vh; background: #FFFFFF; }
    .form-section { width: 100%; display: flex; align-items: center; justify-content: center; padding: 60px 20px; background: #FFFFFF; overflow-y: auto; }
    .form-section.full-width { flex: 1; }
    .form-container { width: 100%; max-width: 800px; padding: 20px 0; }
    .form-grid { display: flex; flex-direction: column; gap: 20px; }
    .full-column { width: 100%; }
    .back-link { display: inline-flex; align-items: center; gap: 8px; color: #6b7280; text-decoration: none; font-size: 0.9rem; font-weight: 500; margin-bottom: 32px; transition: color 0.3s; }
    .back-link:hover { color: #dc2626; }
    .back-arrow { font-size: 1.2rem; }
    .header { margin-bottom: 32px; }
    .logo { display: flex; align-items: center; gap: 12px; font-size: 1.8rem; font-weight: 800; color: #111827; margin-bottom: 20px; }
    .logo-icon { color: #dc2626; }
    .header h1 { font-size: 2rem; font-weight: 700; color: #111827; margin: 0 0 12px 0; letter-spacing: -0.02em; }
    .subtitle { font-size: 1rem; color: #6b7280; margin: 0; line-height: 1.5; }
    .register-form { display: flex; flex-direction: column; gap: 24px; }
    .role-selection { margin-bottom: 8px; }
    .role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
    .role-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; background: #FFFFFF; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
    .role-card:hover { border-color: #dc2626; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1); }
    .role-card.active { border-color: #dc2626; background: #fef2f2; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15); }
    .role-lucide-icon { color: #4b5563; transition: color 0.3s; }
    .role-card.active .role-lucide-icon { color: #dc2626; }
    .role-name { font-size: 0.9rem; font-weight: 600; color: #374151; }
    .section-label { font-size: 0.9rem; font-weight: 600; color: #374151; }
    .section-label-with-icon { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: #374151; }
    .section-divider { padding: 12px 0; border-bottom: 1px solid #e5e7eb; margin: 8px 0 16px 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 0.9rem; font-weight: 600; color: #374151; }
    .form-input { width: 100%; padding: 12px 16px; font-size: 1rem; color: #111827; background: #FFFFFF; border: 1.5px solid #e5e7eb; border-radius: 8px; transition: all 0.3s; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1); }
    .conditional-section { animation: slideDown 0.3s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .error-message { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 0.9rem; }
    .submit-btn { width: 100%; padding: 14px 24px; font-size: 1rem; font-weight: 600; color: #FFFFFF; background: #dc2626; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2); margin-top: 8px; }
    .submit-btn:hover:not(:disabled) { background: #b91c1c; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #FFFFFF; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .form-footer { text-align: center; margin-top: 8px; }
    .link { color: #dc2626; text-decoration: none; font-weight: 600; }
    .link:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  form = {
    fullName: '', email: '', password: '', username: '', role: 'ROLE_CITIZEN',
    phone: '', region: '', city: '', state: '', pincode: '',
    responderType: '', badgeNumber: '', accessCode: ''
  };

  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  setRole(role: string) {
    this.form.role = role;
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    console.log('Attempting registration for:', this.form.username);

    this.authService.register(this.form)
      .pipe(
        finalize(() => {
          this.loading = false;
          console.log('Registration request completed');
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Registration successful:', res);
          // Redirect to login page as requested
          this.router.navigate(['/auth/login'], { queryParams: { registered: 'true' } });
        },
        error: (err) => {
          console.error('Registration error:', err);
          if (err.status === 0) {
            this.error = 'Cannot connect to server. Please ensure the backend is running.';
          } else {
            this.error = err.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
  }
}
