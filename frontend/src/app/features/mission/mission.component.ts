import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="mission-page">
      <!-- Consistent Premium Navbar -->
      <nav class="navbar">
        <div class="logo" routerLink="/">
          <lucide-icon name="siren" [size]="24" class="logo-icon"></lucide-icon>
          <span class="logo-text">Sentinel</span>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/landing">Features</a></li>
          <li><a routerLink="/mission" class="active">Mission</a></li>
          <li><a routerLink="/landing">News</a></li>
          <li><a routerLink="/contact">Contact</a></li>
        </ul>
        <div class="auth-actions">
          <a routerLink="/auth/login" class="btn-login">Log In</a>
          <a routerLink="/auth/register" class="btn-signup">Sign Up</a>
        </div>
      </nav>

      <!-- Sleek White Hero Section -->
      <header class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Our Mission & Goals</h1>
          <p class="hero-tagline">Building a resilient future through intelligent disaster management.</p>
        </div>
      </header>

      <!-- Unified 6 Goals Grid -->
      <main class="content-wrapper">
        <div class="mission-grid">
          <!-- Goal 1 -->
          <div class="mission-card">
            <div class="icon-box"><lucide-icon name="zap" [size]="32"></lucide-icon></div>
            <h3>Real-Time Connectivity</h3>
            <p>Seamlessly bridging the communication gap between citizens, responders, and command centers during critical moments.</p>
          </div>

          <!-- Goal 2 -->
          <div class="mission-card">
            <div class="icon-box"><lucide-icon name="bell" [size]="32"></lucide-icon></div>
            <h3>Zero-Delay Alerts</h3>
            <p>Ensuring that life-saving emergency notifications reach every citizen in affected regions instantly, without latency.</p>
          </div>

          <!-- Goal 3 -->
          <div class="mission-card">
            <div class="icon-box"><lucide-icon name="users" [size]="32"></lucide-icon></div>
            <h3>Resource Optimization</h3>
            <p>Intelligently coordinating personnel, medical supplies, and equipment to maximize rescue efficiency and save lives.</p>
          </div>

          <!-- Goal 4 -->
          <div class="mission-card">
            <div class="icon-box"><lucide-icon name="layout-dashboard" [size]="32"></lucide-icon></div>
            <h3>Situational Intelligence</h3>
            <p>Providing authorities with a comprehensive, live overview of all active incidents to enable data-driven decision making.</p>
          </div>

          <!-- Goal 5 -->
          <div class="mission-card">
            <div class="icon-box"><lucide-icon name="shield" [size]="32"></lucide-icon></div>
            <h3>Citizen Empowerment</h3>
            <p>Equipping every individual with the tools and knowledge to report incidents, help their community, and stay safe.</p>
          </div>

          <!-- Goal 6 -->
          <div class="mission-card">
            <div class="icon-box"><lucide-icon name="target" [size]="32"></lucide-icon></div>
            <h3>Impact Resilience</h3>
            <p>Continuously learning from historical data to predict emerging threats and mitigate disaster damage across all regions.</p>
          </div>
        </div>
      </main>

      <footer class="mission-footer">
        <p class="footer-quote">"Empowering response. Saving lives. Every second matters."</p>
      </footer>
    </div>
  `,
  styles: [`
    .mission-page {
      min-height: 100vh;
      background: #ffffff;
      font-family: 'Inter', -apple-system, sans-serif;
      padding-top: 80px;
    }

    /* Navbar Alignment */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10%;
      height: 80px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid #f1f5f9;
      z-index: 1000;
    }

    .logo { display: flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; }
    .logo-icon { color: #dc2626; }
    .logo-text { font-size: 1.5rem; font-weight: 850; color: #0f172a; letter-spacing: -0.5px; }

    .nav-links { display: flex; list-style: none; gap: 40px; margin: 0; padding: 0; }
    .nav-links a { text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.95rem; transition: all 0.2s; }
    .nav-links a:hover, .nav-links a.active { color: #dc2626; }

    .btn-signup {
      text-decoration: none;
      background: #dc2626;
      color: white;
      padding: 11px 26px;
      border-radius: 10px;
      font-weight: 700;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
    }
    .btn-login { text-decoration: none; color: #0f172a; font-weight: 600; padding: 0 10px; }

    /* Hero */
    .hero {
      padding: 100px 10% 60px;
      text-align: center;
      background: #ffffff;
    }
    .hero-title { font-size: 4rem; font-weight: 900; color: #0f172a; margin-bottom: 16px; letter-spacing: -2px; }
    .hero-tagline { font-size: 1.4rem; color: #64748b; font-weight: 500; letter-spacing: -0.5px; max-width: 800px; margin: 0 auto; }

    /* Content */
    .content-wrapper { max-width: 1400px; margin: 0 auto; padding: 40px 10% 120px; }
    .mission-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }

    .mission-card {
      background: #ffffff;
      padding: 48px 40px;
      border-radius: 24px;
      border: 1px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .mission-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(0,0,0,0.06);
      border-color: #dc2626;
    }

    .icon-box {
      width: 72px;
      height: 72px;
      background: #fef2f2;
      color: #dc2626;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      transition: all 0.3s ease;
    }
    .mission-card:hover .icon-box { background: #dc2626; color: #ffffff; transform: scale(1.1) rotate(5deg); }

    .mission-card h3 { font-size: 1.6rem; font-weight: 850; color: #0f172a; margin-bottom: 20px; letter-spacing: -0.5px; }
    .mission-card p { font-size: 1.05rem; color: #64748b; line-height: 1.65; font-weight: 500; }

    /* Footer Quote */
    .mission-footer { text-align: center; padding: 60px 10% 140px; border-top: 1px solid #f1f5f9; }
    .footer-quote { font-size: 1.5rem; font-weight: 800; color: #1e293b; letter-spacing: -1px; }

    /* Responsive Design */
    @media (max-width: 1200px) { .mission-grid { gap: 24px; } }
    @media (max-width: 1024px) { .mission-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .mission-grid { grid-template-columns: 1fr; }
      .hero-title { font-size: 3rem; }
      .hero-tagline { font-size: 1.2rem; }
      .content-wrapper { padding: 40px 5% 80px; }
      .navbar { padding: 0 5%; }
    }
  `]
})
export class MissionComponent { }
