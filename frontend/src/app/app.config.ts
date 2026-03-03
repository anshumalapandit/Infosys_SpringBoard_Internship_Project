import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {
  LucideAngularModule,
  Siren, Zap, Shield, Lock, Satellite, Activity,
  LayoutDashboard, Bell, Map, ShieldCheck, Key,
  PhoneCall, Mail, CircleCheck, User, FileText,
  MessageSquare, Home, TriangleAlert, List, History,
  MapPin, Settings, Users, Flame, Waves, ShieldAlert,
  CircleAlert, ArrowLeft, Radio, LifeBuoy, BarChart3,
  Search, Filter, Plus, Send, ExternalLink, MoreVertical,
  LogOut, TrendingUp, TrendingDown, Megaphone, X, Trash2, Eye, ChevronDown, Check, XCircle, RotateCcw
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled'
    })),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({
      Siren, Zap, Shield, Lock, Satellite, Activity,
      LayoutDashboard, Bell, Map, ShieldCheck, Key,
      PhoneCall, Mail, CircleCheck, User, FileText,
      MessageSquare, Home, TriangleAlert, List, History,
      MapPin, Settings, Users, Flame, Waves, ShieldAlert,
      CircleAlert, ArrowLeft, Radio, LifeBuoy, BarChart3,
      Search, Filter, Plus, Send, ExternalLink, MoreVertical,
      LogOut, TrendingUp, TrendingDown, Megaphone, X, Trash2, Eye, ChevronDown, Check, XCircle, RotateCcw
    }))
  ]
};
