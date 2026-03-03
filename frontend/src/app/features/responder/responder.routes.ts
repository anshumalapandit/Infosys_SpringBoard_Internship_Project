import { Routes } from '@angular/router';
import { ResponderDashboardComponent } from './dashboard/dashboard.component';

export const RESPONDER_ROUTES: Routes = [
    { path: 'dashboard', component: ResponderDashboardComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
