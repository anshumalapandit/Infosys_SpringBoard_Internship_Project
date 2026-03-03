import { Component } from '@angular/core';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    template: `
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f172a; color: white; font-family: sans-serif;">
      <h1 style="font-size: 4rem; margin: 0;">403</h1>
      <p style="color: #94a3b8;">Access Denied: You do not have permission to view this page.</p>
      <a href="/auth/login" style="margin-top: 20px; color: #6366f1; text-decoration: none; border: 1px solid #6366f1; padding: 10px 20px; border-radius: 8px;">Back to Login</a>
    </div>
  `
})
export class UnauthorizedComponent { }
