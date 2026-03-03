import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private router = inject(Router);
  public isLandingPage = signal(false);

  constructor() {
    this.checkLandingPage(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkLandingPage(event.urlAfterRedirects || event.url);
    });
  }

  private checkLandingPage(url: string) {
    const isLanding = url === '/' || url.startsWith('/landing') || url === '' || url.includes('index.html');
    this.isLandingPage.set(isLanding);
  }
}
