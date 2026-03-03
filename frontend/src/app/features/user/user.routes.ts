import { Routes } from '@angular/router';
import { UserDashboardComponent } from './dashboard/dashboard.component';

export const USER_ROUTES: Routes = [
    { path: 'dashboard', component: UserDashboardComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
