import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { map } from 'rxjs';

export const hasRoleCodeGuard: CanMatchFn = (route, segments) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  
  const allowedRoleCodes: number[] = route.data?.['allowedRoleCodes'] as number[] ?? [];
  
  return sessionService.isAuthenticated$.pipe(
    map(() =>
      sessionService.hasRoleCodes(allowedRoleCodes)
        ? true
        : router.parseUrl('/home')
    )
  );
};
