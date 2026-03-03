import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])],
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'responder',
        canActivate: [authGuard, roleGuard(['ROLE_RESPONDER'])],
        loadChildren: () => import('./features/responder/responder.routes').then(m => m.RESPONDER_ROUTES)
    },
    {
        path: 'user',
        canActivate: [authGuard, roleGuard(['ROLE_CITIZEN'])],
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
    },
    { path: 'landing', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
    { path: 'unauthorized', loadComponent: () => import('./shared/components/unauthorized.component').then(m => m.UnauthorizedComponent) },
    { path: '', redirectTo: 'landing', pathMatch: 'full' }
];
