import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../../notification.service';
import { NotificationKPIViewedModel } from '../../../models/notifications/notification';

interface DateFilter {
  dateFrom: string | null;
  dateUntil: string | null;
}

interface NotificationStats {
  total: number;
  viewed: number;
  viewedRate: number;
  dateRange: DateFilter;
}



@Injectable({
  providedIn: 'root'
})
export class KpiViewedRateService {

  private notificationService = inject(NotificationService);

  private notifications: NotificationKPIViewedModel[] = [];
  private currentFilter$ = new BehaviorSubject<DateFilter>({
    dateFrom: null,
    dateUntil: null
  });

  private stats$ = new BehaviorSubject<NotificationStats>({
    total: 0,
    viewed: 0,
    viewedRate: 0,
    dateRange: {
      dateFrom: null,
      dateUntil: null
    }
  });

  getViewedStats(): Observable<NotificationStats> {
    return this.stats$.asObservable();
  }

  getViewedRate(): Observable<number> {
    return this.stats$.pipe(
      map(stats => stats.viewedRate)
    );
  }

  loadNotificationStats(): void {
    this.notificationService.getAllNotificationsNotFiltered()
      .subscribe({
        next: (notifications: NotificationKPIViewedModel[]) => {
          this.notifications = notifications;
          this.updateStats();
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.resetStats();
        }
      });
  }

  updateDateFilter(filter: DateFilter): void {
    this.currentFilter$.next(filter);
    this.updateStats();
  }

  private updateStats(): void {
    const filteredNotifications = this.applyDateFilter(this.notifications);
    const stats = this.calculateStats(filteredNotifications);
    this.stats$.next({
      ...stats,
      dateRange: this.currentFilter$.value
    });
  }

  private applyDateFilter(notifications: NotificationKPIViewedModel[]): NotificationKPIViewedModel[] {
    const filter = this.currentFilter$.value;

    if (!filter.dateFrom && !filter.dateUntil) {
      return notifications;
    }

    return notifications.filter(notification => {
      const notificationDate = this.parseNotificationDate(notification.dateSend);
      const fromDate = filter.dateFrom ? new Date(filter.dateFrom) : null;
      const untilDate = filter.dateUntil ? new Date(filter.dateUntil) : null;

      return (!fromDate || notificationDate >= fromDate) &&
             (!untilDate || notificationDate <= untilDate);
    });
  }

  private parseNotificationDate(dateString: string): Date {
    const [datePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  private calculateStats(notifications: NotificationKPIViewedModel[]): NotificationStats {
    const total = notifications.length;
    const viewed = notifications.filter(n => n.statusSend === 'SENT').length;

    return {
      total,
      viewed,
      viewedRate: total > 0 ? (viewed / total) * 100 : 0,
      dateRange: this.currentFilter$.value
    };
  }

  resetStats(): void {
    this.currentFilter$.next({
      dateFrom: null,
      dateUntil: null
    });
    this.stats$.next({
      total: 0,
      viewed: 0,
      viewedRate: 0,
      dateRange: {
        dateFrom: null,
        dateUntil: null
      }
    });
  }
}
