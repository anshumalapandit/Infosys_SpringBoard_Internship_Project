import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Siren,
  Zap,
  Shield,
  Lock,
  Satellite,
  Activity,
  LayoutDashboard,
  Bell,
  Map,
  ShieldCheck,
  Key
} from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="landing-page">
      <!-- Premium Navbar -->
      <nav class="navbar">
        <div class="logo">
          <lucide-icon name="siren" class="logo-icon"></lucide-icon>
          <span class="logo-text">Sentinel</span>
        </div>
        <ul class="nav-links">
          <li><a href="#features" (click)="scrollToSection($event, 'features')">Features</a></li>
          <li><a routerLink="/mission">Mission</a></li>
          <li><a href="#news" (click)="scrollToSection($event, 'features')">News</a></li>
          <li><a routerLink="/contact">Contact</a></li>
        </ul>
        <div class="auth-actions">
          <a routerLink="/auth/login" class="btn-login">Log In</a>
          <a routerLink="/auth/register" class="btn-signup">Sign Up</a>
        </div>
      </nav>

      <!-- Hero Section with Scoped Video Background -->
      <section class="hero">
        <!-- Hero Background Video -->
        <div class="hero-video-bg">
          <div class="video-wrapper">
            <iframe class="bg-video-iframe"
              src="https://www.youtube.com/embed/9U9WmFIGtUA?autoplay=1&mute=1&loop=1&playlist=9U9WmFIGtUA&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1"
              frameborder="0" allow="autoplay; encrypted-media">
            </iframe>
          </div>
          <div class="video-overlay"></div>
        </div>

        <!-- Hero Content -->
        <div class="hero-content">
          <div class="hero-badge">
            <lucide-icon name="zap" [size]="16" class="badge-icon"></lucide-icon>
            <span>Next-Gen Emergency Response Platform</span>
          </div>
          <h1 class="hero-title">
            When Every Second
            <span class="title-highlight">Counts</span>
          </h1>
          <p class="hero-description">
            Sentinel connects citizens, emergency responders, and authorities in real-time 
            during critical moments. Report incidents, coordinate rescue operations, and 
            save lives with our advanced disaster management system.
          </p>
          <div class="hero-buttons">
            <a routerLink="/auth/register" class="btn-hero-primary">
              <lucide-icon name="siren" [size]="20" class="btn-icon"></lucide-icon>
              <span>Report Emergency</span>
            </a>
            <a routerLink="/auth/login" class="btn-hero-secondary">
              <lucide-icon name="key" [size]="20" class="btn-icon"></lucide-icon>
              <span>Responder Login</span>
            </a>
          </div>
          
          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Active Monitoring</div>
            </div>
            <div class="stat">
              <div class="stat-number">< 2min</div>
              <div class="stat-label">Avg Response Time</div>
            </div>
            <div class="stat">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features">
        <div class="section-header">
          <span class="section-badge">Our Capabilities</span>
          <h2>Comprehensive Emergency Management</h2>
          <p>Advanced tools designed for rapid response and effective coordination</p>
        </div>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <lucide-icon name="satellite" [size]="40" class="feature-lucide-icon"></lucide-icon>
            </div>
            <h3>Real-Time Tracking</h3>
            <p>GPS-enabled incident reporting with precise location data for faster emergency response and resource allocation.</p>
            <div class="feature-tag">Instant</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <lucide-icon name="activity" [size]="40" class="feature-lucide-icon"></lucide-icon>
            </div>
            <h3>Responder Network</h3>
            <p>Direct communication with Police, Fire, Medical, and Search & Rescue teams for coordinated emergency operations.</p>
            <div class="feature-tag">Connected</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <lucide-icon name="layout-dashboard" [size]="40" class="feature-lucide-icon"></lucide-icon>
            </div>
            <h3>Command Dashboard</h3>
            <p>Complete situational awareness with analytics, incident tracking, and resource management for authorities.</p>
            <div class="feature-tag">Intelligent</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <lucide-icon name="bell" [size]="40" class="feature-lucide-icon"></lucide-icon>
            </div>
            <h3>Alert System</h3>
            <p>Region-based emergency notifications to keep citizens informed and safe during disaster situations.</p>
            <div class="feature-tag">Targeted</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <lucide-icon name="map" [size]="40" class="feature-lucide-icon"></lucide-icon>
            </div>
            <h3>Incident Mapping</h3>
            <p>Visual representation of all active incidents with heat maps and zone-based filtering for better coordination.</p>
            <div class="feature-tag">Visual</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <lucide-icon name="shield-check" [size]="40" class="feature-lucide-icon"></lucide-icon>
            </div>
            <h3>Secure Platform</h3>
            <p>End-to-end encryption, role-based access control, and compliance with data protection regulations.</p>
            <div class="feature-tag">Protected</div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of citizens and responders using Sentinel to save lives every day.</p>
          <div class="cta-buttons">
            <a routerLink="/auth/register" class="btn-cta-primary">Get Started Now</a>
            <a routerLink="/auth/login" class="btn-cta-secondary">Sign In</a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer id="contact" class="footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <lucide-icon name="siren" [size]="24" class="footer-icon"></lucide-icon>
              <span>Sentinel</span>
            </div>
            <p>Advanced disaster management and emergency response platform</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a routerLink="/mission">Mission</a>
              <a href="#responders">For Responders</a>
            </div>
            <div class="footer-column">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API</a>
              <a routerLink="/contact">Support</a>
            </div>
            <div class="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Sentinel. All rights reserved.</p>
          <div class="footer-security">
            <span>256-bit Encryption</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Landing Page Container */
    .landing-page {
      background: transparent;
      color: #111827;
      min-height: 100vh;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }

    /* Navbar */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 80px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transition: all 0.3s;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 800;
      cursor: pointer;
    }

    .logo-icon {
      color: #dc2626;
      display: flex;
      align-items: center;
      animation: pulse 2s ease-in-out infinite;
    }

    .logo-text {
      background: linear-gradient(135deg, #dc2626, #111827);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: 40px;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      color: #374151;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: color 0.3s;
      position: relative;
    }

    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #dc2626, #ffffff);
      transition: width 0.3s;
    }

    .nav-links a:hover {
      color: #dc2626;
    }

    .nav-links a:hover::after {
      width: 100%;
    }

    .auth-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .btn-login {
      color: #374151;
      text-decoration: none;
      font-weight: 600;
      padding: 10px 24px;
      border-radius: 8px;
      transition: all 0.3s;
    }

    .btn-login:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #dc2626;
    }

    .btn-signup {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      text-decoration: none;
      font-weight: 700;
      padding: 12px 28px;
      border-radius: 10px;
      transition: all 0.3s;
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
    }

    .btn-signup:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(220, 38, 38, 0.6);
    }

    /* Hero Section - Scoped Video Background */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 120px 80px 80px;
      overflow: hidden;
      background: #111827; /* Dark navy fallback instead of pure black */
    }

    .hero-video-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }

    .video-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .bg-video-iframe {
      width: 130vw; /* Increased scale to crop any letterboxing */
      height: 130vh; /* Increased scale to crop any letterboxing */
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1.1); /* Added extra scale factor */
      pointer-events: none;
      filter: brightness(0.85); /* Slightly dimmed for better text contrast */
    }

    @media (min-aspect-ratio: 16/9) {
      .bg-video-iframe {
        width: 110vw;
        height: 61.88vw; /* (9/16) * 110vw - maintaining aspect with buffer */
      }
    }

    @media (max-aspect-ratio: 16/9) {
      .bg-video-iframe {
        width: 195.55vh; /* (16/9) * 110vh - maintaining aspect with buffer */
        height: 110vh;
      }
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
      z-index: 2;
    }

    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 900px;
      padding: 0 20px;
      animation: fadeInUp 1s ease-out;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 10px 24px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 30px;
      backdrop-filter: blur(10px);
    }

    .badge-icon {
      font-size: 1.2rem;
    }

    .hero-title {
      font-size: 5rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 40px 0;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8); /* Stronger shadow directed by user */
    }

    .title-highlight {
      display: block;
      background: linear-gradient(135deg, #dc2626 0%, #ff4d4d 50%, #dc2626 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
    }

    .hero-description {
      font-size: 1.3rem;
      line-height: 1.8;
      color: #FFFFFF;
      margin: 0 auto 50px;
      max-width: 750px;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
      opacity: 0.95;
    }

    .hero-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 60px;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 18px 40px;
      border-radius: 12px;
      transition: all 0.3s;
      box-shadow: 0 8px 32px rgba(220, 38, 38, 0.5);
    }

    .btn-hero-primary:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(220, 38, 38, 0.7);
    }

    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: 2px solid #FFFFFF;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 18px 40px;
      border-radius: 12px;
      transition: all 0.3s;
    }

    .btn-hero-secondary:hover {
      background: #FFFFFF;
      color: #111827;
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
    }

    .btn-icon {
      display: flex;
      align-items: center;
    }

    /* Hero Stats */
    .hero-stats {
      display: flex;
      gap: 60px;
      justify-content: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, #dc2626, #111827);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 600;
    }

    /* Features Section */
    .features {
      padding: 120px 80px;
      background: #f9fafb;
    }

    .section-header {
      text-align: center;
      margin-bottom: 80px;
    }

    .section-badge {
      display: inline-block;
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.3);
      color: #dc2626;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 20px;
    }

    .section-header h2 {
      font-size: 3.5rem;
      font-weight: 900;
      margin: 0 0 20px 0;
      letter-spacing: -0.02em;
      color: #111827;
    }

    .section-header p {
      font-size: 1.2rem;
      color: #6b7280;
      max-width: 600px;
      margin: 0 auto;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
    }

    .feature-card {
      background: #FFFFFF;
      backdrop-filter: blur(20px);
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 40px;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #dc2626, #ffffff);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      border-color: rgba(220, 38, 38, 0.4);
      box-shadow: 0 16px 48px rgba(220, 38, 38, 0.3);
    }

    .feature-card:hover::before {
      opacity: 1;
    }

    .feature-icon-wrapper {
      margin-bottom: 24px;
      color: #dc2626;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 16px 0;
      color: #111827;
    }

    .feature-card p {
      color: #6b7280;
      line-height: 1.7;
      margin: 0 0 20px 0;
    }

    .feature-tag {
      display: inline-block;
      background: rgba(220, 38, 38, 0.1);
      color: #dc2626;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* CTA Section */
    .cta-section {
      padding: 100px 80px;
      background: #FFFFFF;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    }

    .cta-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: 3rem;
      font-weight: 900;
      margin: 0 0 20px 0;
      color: #111827;
    }

    .cta-content p {
      font-size: 1.2rem;
      color: #6b7280;
      margin: 0 0 40px 0;
    }

    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
    }

    .btn-cta-primary {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 18px 40px;
      border-radius: 12px;
      transition: all 0.3s;
      box-shadow: 0 8px 32px rgba(220, 38, 38, 0.5);
    }

    .btn-cta-primary:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(220, 38, 38, 0.7);
    }

    .btn-cta-secondary {
      background: transparent;
      border: 2px solid #dc2626;
      color: #dc2626;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 18px 40px;
      border-radius: 12px;
      transition: all 0.3s;
    }

    .btn-cta-secondary:hover {
      background: #dc2626;
      border-color: #dc2626;
      color: #FFFFFF;
      transform: translateY(-4px);
    }

    /* Footer */
    .footer {
      background: #f9fafb;
      padding: 80px 80px 40px;
      border-top: 1px solid #e5e7eb;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      margin-bottom: 60px;
    }

    .footer-brand {
      max-width: 300px;
    }

    .footer-logo {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 16px;
      color: #111827;
    }

    .footer-brand p {
      color: #6b7280;
      line-height: 1.6;
    }

    .footer-links {
      display: flex;
      gap: 80px;
    }

    .footer-column h4 {
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 20px 0;
      color: #dc2626;
    }

    .footer-column a {
      display: block;
      color: #6b7280;
      text-decoration: none;
      margin-bottom: 12px;
      transition: color 0.3s;
    }

    .footer-column a:hover {
      color: #dc2626;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 40px;
      border-top: 1px solid #e5e7eb;
    }

    .footer-bottom p {
      color: #9ca3af;
      margin: 0;
    }

    .footer-security {
      display: flex;
      gap: 20px;
    }

    .footer-security span {
      font-size: 0.85rem;
      color: #9ca3af;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .navbar {
        padding: 20px 40px;
      }

      .nav-links {
        display: none;
      }

      .hero {
        padding: 120px 40px 80px;
      }

      .hero-title {
        font-size: 3.5rem;
      }

      .hero-buttons {
        flex-direction: column;
      }

      .hero-stats {
        flex-direction: column;
        gap: 30px;
      }

      .features {
        padding: 80px 40px;
      }

      .feature-grid {
        grid-template-columns: 1fr;
      }

      .cta-section {
        padding: 80px 40px;
      }

      .footer {
        padding: 60px 40px 30px;
      }

      .footer-content {
        flex-direction: column;
        gap: 40px;
      }

      .footer-links {
        gap: 40px;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .section-header h2 {
        font-size: 2.5rem;
      }

      .btn-hero-primary,
      .btn-hero-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class LandingComponent {
  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
