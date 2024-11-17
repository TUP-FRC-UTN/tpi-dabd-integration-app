import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../../users/services/session.service';

export const hasRoleCodeGuard: CanMatchFn = (route, segments) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const allowedRoleCodes: number[] =
    (route.data?.['allowedRoleCodes'] as number[]) ?? [];

  return sessionService.isAuthenticated$.pipe(
    map(() =>
      sessionService.hasRoleCodes(allowedRoleCodes)
        ? true
        : router.parseUrl('/home')
    )
  );
};
