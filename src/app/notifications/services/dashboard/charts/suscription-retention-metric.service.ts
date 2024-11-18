import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SubscriptionService } from '../../subscription.service';
import { ContactService } from '../../contact.service';
import { RetentionMetric } from '../../../models/kpi/kpiModel';
import { ChartData, ChartOptions } from 'chart.js';

interface RetentionChartState {
  data: ChartData<'bar'>;
  options: ChartOptions<'bar'>;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionRetentionMetricService {
  private readonly CHART_COLORS = {
    primary: 'rgba(98, 182, 143, 0.8)',
    primaryBorder: 'rgba(98, 182, 143, 1)',
    background: 'rgba(98, 182, 143, 0.1)'
  };

  private chartState$ = new BehaviorSubject<RetentionChartState>({
    data: {
      labels: [],
      datasets: [{
        data: [],
        label: 'Tasa de Retención (%)',
        backgroundColor: this.CHART_COLORS.primary,
        borderColor: this.CHART_COLORS.primaryBorder,
        borderWidth: 1,
        barThickness: 'flex',
        maxBarThickness: 35
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.x.toFixed(1)}% de retención`,
            afterLabel: (context) => {
              const metric = context.raw as RetentionMetric;
              return `${metric.activeUsers} de ${metric.totalUsers} usuarios activos`;
            }
          }
        },
        title: {
          display: true,
          text: 'Tasa de Retención de Notificaciones Opcionales',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: { bottom: 20 }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          grid: {
            display: true,
            color: this.CHART_COLORS.background
          },
          border: {
            display: true
          },
          title: {
            display: true,
            text: 'Porcentaje de Retención',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            callback: (value) => `${value}%`
          }
        },
        y: {
          grid: {
            display: false
          },
          border: {
            display: true
          }
        }
      },
      animation: {
        duration: 750
      }
    }
  });

  constructor(
    private subscriptionService: SubscriptionService,
    private contactService: ContactService
  ) { }

  getChartData(): Observable<ChartData<'bar'>> {
    return this.chartState$.pipe(map(state => state.data));
  }

  getChartOptions(): ChartOptions<'bar'> {
    return this.chartState$.value.options;
  }

  loadData(): Observable<void> {
    return forkJoin({
      subscriptionTypes: this.subscriptionService.getAllSubscriptions(),
      contacts: this.contactService.getAllContacts()
    }).pipe(
      map(({ subscriptionTypes, contacts }) => {
        const retentionMetrics = this.calculateRetentionMetrics(contacts, subscriptionTypes);
        this.updateChartData(retentionMetrics);
      }),
      catchError((error) => {
        console.error('Error loading retention metrics:', error);
        throw error;
      })
    );
  }

  private calculateRetentionMetrics(contacts: any[], subscriptionTypes: any[]): RetentionMetric[] {
    const optionalSubs = subscriptionTypes
      .filter(sub => sub.isUnsubscribable)
      .map(sub => sub.name);

    const totalUsers = contacts.length;

    return optionalSubs.map(subName => {
      const activeUsers = contacts.filter(contact =>
        contact.subscriptions.includes(subName)
      ).length;

      return {
        subscriptionName: subName,
        totalUsers,
        activeUsers,
        retentionRate: (activeUsers / totalUsers) * 100
      };
    });
  }

  private updateChartData(metrics: RetentionMetric[]): void {
    const newState = {
      ...this.chartState$.value,
      data: {
        labels: metrics.map(m => this.subscriptionService.getSubscriptionNameInSpanish(m.subscriptionName)),
        datasets: [{
          ...this.chartState$.value.data.datasets[0],
          data: metrics.map(m => m.retentionRate)
        }]
      }
    };

    this.chartState$.next(newState);
  }

  resetData(): void {
    const emptyState = {
      ...this.chartState$.value,
      data: {
        labels: [],
        datasets: [{
          ...this.chartState$.value.data.datasets[0],
          data: []
        }]
      }
    };

    this.chartState$.next(emptyState);
  }
}
