import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { ContactService } from '../../../services/contact.service';
import { NotificationModelChart } from '../../../models/notifications/notification';
import { ContactModel } from '../../../models/contacts/contactModel';
import { ChartConfigurationService } from '../../../services/chart-configuration.service';
import { KPIModel, RetentionKPIs, RetentionMetric } from '../../../models/kpi/kpiModel';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { IaService } from '../../../services/ia-service';
import { ChartData, ChartConfiguration } from 'chart.js';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SubscriptionService } from '../../../services/subscription.service';
import { SubscriptionStat } from '../../../models/suscriptions/subscription'


@Component({
  selector: 'app-notification-chart',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    BaseChartDirective,
    MainContainerComponent,
    RouterModule
  ],
  templateUrl: './notification-chart.component.html',
  styleUrl: './notification-chart.component.css'
})


export class NotificationChartComponent implements OnInit {



  filterNotifications() {


  }


  @ViewChild('statusChart') statusChart?: BaseChartDirective;
  @ViewChild('templateChart') templateChart?: BaseChartDirective;
  @ViewChild('dailyChart') dailyChart?: BaseChartDirective;
  @ViewChild('weeklyChart') weeklyChart?: BaseChartDirective;
  @ViewChild('contactTypeChart') contactTypeChart?: BaseChartDirective;


  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);
  notificationService = inject(NotificationService);
  contactService = inject(ContactService);
  chartConfigurationService = inject(ChartConfigurationService);
  iaService = inject(IaService);
  subscriptionService = inject(SubscriptionService);


  today: string = new Date().toISOString().split('T')[0];
  dateFrom: string = '';
  dateUntil: string = '';
  searchSubject: string = '';
  searchEmail: string = '';
  selectedStatus: 'ALL' | 'SENT' | 'VISUALIZED' = 'ALL';
  statusFilter: string = '';
  recipientFilter: string = '';
  notificationSubjectFilter: string = '';
  isDropdownOpen = false;
  isModalOpen = false;
  modalTitle = '';
  modalMessage = '';

  statusChartData = this.chartConfigurationService.statusChartData;
  templateChartData = this.chartConfigurationService.templateChartData;
  dailyChartData = this.chartConfigurationService.dailyChartData;
  statusChartOptions = this.chartConfigurationService.statusChartOptions;
  templateChartOptions = this.chartConfigurationService.templateChartOptions;
  dailyChartOptions = this.chartConfigurationService.dailyChartOptions;
  contactTypeChartOptions = this.chartConfigurationService.statusChartOptions;

  availableTemplates: string[] = []; // Lista de plantillas disponibles
  selectedTemplate: string = ''; // Plantilla seleccionada por el usuario
  retentionKPIs: RetentionKPIs = {
    averageRetention: 0,
    highestRetention: '',
    lowestRetention: '',
    subscriptionsAbove80: 0
  };


  isTooltipOpen = false;
  isLoading = false;
  iaResponse = '';
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  kpis!: KPIModel;

  notifications: NotificationModelChart[] = []
  contacts: ContactModel[] = []








  getAllNotifications() {

    this.notificationService.getAllNotificationsNotFiltered().subscribe((data) => {

      this.notifications = data;

    })

  }

  getAllContacts() {
    this.contactService.getAllContacts().subscribe((data) => {
      this.contacts = data;
      console.log('contacts at getAllContacts: ', this.contacts)
      this.updateContactTypeChart();
    });
  }

  ngOnInit() {


    this.loadContactsAndSubscriptions();



    this.getAllContacts();
    this.getAllNotifications();
    this.notificationService.getAllNotificationsNotFiltered().subscribe((data) => {
      this.notifications = data;

      // Obtener todas las plantillas únicas
      this.availableTemplates = Array.from(new Set(data.map(notification => notification.templateName)));

      const today = new Date();
      this.dateFrom = this.formatDate(today);

      const tomorrow = new Date(today);
      today.setDate(today.getDate() + 2);
      tomorrow.setDate(today.getDate());
      this.dateUntil = this.formatDate(tomorrow);

      if (this.isBrowser) {
        this.filterAndUpdateCharts();
      }
    });




  }

  updateContactTypeChart() {
    


      const contactTypeCounts = {
        'Correo electrónico': 0,
        'Teléfono': 0,
        'Red social': 0
      };

      this.contacts.forEach(contact => {
        if (contact.active) {
          contactTypeCounts[contact.contactType as keyof typeof contactTypeCounts]++;
        }
      });

      this.contactTypeChartData = {
        labels: ['Email', 'Teléfono', 'Redes Sociales'],
        datasets: [{
          data: [
            contactTypeCounts['Correo electrónico'],
            contactTypeCounts['Teléfono'],
            contactTypeCounts['Red social']
          ],
          backgroundColor: ['rgba(255, 171, 145, 1)', 'rgba(144, 202, 249, 1)', 'rgba(188, 170, 164, 1'],
          hoverBackgroundColor: ['rgba(255, 171, 145, 1)', 'rgba(144, 202, 249, 1)', 'rgba(188, 170, 164, 1']
        }]
      };
      setTimeout(() => {
        this.contactTypeChart?.update();
      });
  }


  applyFilters() {
    this.filterAndUpdateCharts();
    this.isDropdownOpen = false;
  }


  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchSubject) count++;
    if (this.searchEmail) count++;
    if (this.selectedStatus !== 'ALL') count++;
    if (this.dateFrom) count++;
    if (this.dateUntil) count++;
    return count;
  }

  resetFilters() {
    this.searchSubject = '';
    this.searchEmail = '';
    this.selectedStatus = 'ALL';
    this.dateFrom = '';
    this.dateUntil = '';
    this.selectedTemplate = 'ALL';
    this.filterAndUpdateCharts();
  }

  private filterAndUpdateCharts(): void {
    let filteredData = [...this.notifications];

    if (this.dateFrom || this.dateUntil) {
      filteredData = filteredData.filter(notification => {
        const notificationDate = new Date(this.convertToISODate(notification.dateSend));
        const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
        const untilDate = this.dateUntil ? new Date(this.dateUntil) : null;

        return (!fromDate || notificationDate >= fromDate) &&
          (!untilDate || notificationDate <= untilDate);
      });
    }

    if (this.searchSubject) {
      filteredData = filteredData.filter(notification =>
        notification.subject.toLowerCase().includes(this.searchSubject.toLowerCase())
      );
    }

    if (this.searchEmail) {
      filteredData = filteredData.filter(notification =>
        notification.recipient.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'ALL') {
      filteredData = filteredData.filter(notification =>
        notification.statusSend === this.selectedStatus
      );
    }

    if (this.selectedTemplate) {
      filteredData = filteredData.filter(notification =>
        notification.templateName === this.selectedTemplate
      );
    }

    this.updateChartsWithData(filteredData);
    this.updateWeeklyChartData(filteredData);
  }


  private convertToISODate(dateString: string): string {
    const [date, time] = dateString.split(' ');
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}T${time}`;
  }

  private updateChartsWithData(data: any[]): void {

    const statusCount = {
      SENT: 0,
      VISUALIZED: 0
    };

    data.forEach(notification => {
      statusCount[notification.statusSend as keyof typeof statusCount]++;
    });

    this.statusChartData = {
      ...this.chartConfigurationService.statusChartData,
      datasets: [{
        ...this.chartConfigurationService.statusChartData.datasets[0],
        data: [statusCount.SENT, statusCount.VISUALIZED]
      }]
    };


    const templateCount = new Map<string, number>();
    data.forEach(notification => {
      const count = templateCount.get(notification.templateName) || 0;
      templateCount.set(notification.templateName, count + 1);
    });

    this.templateChartData = {
      labels: Array.from(templateCount.keys()),
      datasets: [{
        data: Array.from(templateCount.values()),
        label: 'Cantidad de Usos',
        backgroundColor: '#36A2EB'
      }]
    };

    const dailyCount = new Map<string, number>();
    data.forEach(notification => {
      const date = notification.dateSend.split(' ')[0];
      const count = dailyCount.get(date) || 0;
      dailyCount.set(date, count + 1);
    });

    const sortedDates = Array.from(dailyCount.keys()).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      return new Date(yearA, monthA - 1, dayA).getTime() -
        new Date(yearB, monthB - 1, dayB).getTime();
    });

    this.dailyChartData = {
      labels: sortedDates,
      datasets: [{
        data: sortedDates.map(date => dailyCount.get(date) || 0),
        label: 'Notificaciones Enviadas',
        fill: false,
        tension: 0.1,
        borderColor: '#36A2EB'
      }]
    };

    setTimeout(() => {
      this.statusChart?.update();
      this.templateChart?.update();
      this.dailyChart?.update();
    });

    this.calculateKPIs(data);
  }


  private calculateKPIs(data: any[]): void {
    const total = data.length;

    const sent = data.filter(n => n.statusSend === 'SENT').length;
    const pending = data.filter(n => n.statusSend === 'VISUALIZED').length;

    const uniqueDays = new Set(data.map(n => n.dateSend.split(' ')[0])).size;

    const templateCount = new Map<string, number>();
    data.forEach(n => {
      templateCount.set(n.templateName, (templateCount.get(n.templateName) || 0) + 1);
    });

    let mostUsedTemplate: [string, number];

    if (this.selectedTemplate) {
      // Si hay filtro por plantilla, mostrar cuántas veces se utilizó
      const count = templateCount.get(this.selectedTemplate) || 0;
      mostUsedTemplate = [this.selectedTemplate, count];
    } else {
      // Si no hay filtro por plantilla, mostrar la plantilla más usada
      mostUsedTemplate = Array.from(templateCount.entries())
        .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    }

    const hourCount = new Map<number, number>();
    data.forEach(n => {
      const hour = parseInt(n.dateSend.split(' ')[1].split(':')[0]);
      hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
    });

    const contactCount = new Map<string, number>();
    data.forEach(n => {
      contactCount.set(n.recipient, (contactCount.get(n.recipient) || 0) + 1);
    });

    const mostFrequentContact = Array.from(contactCount.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);

    const peakHour = Array.from(hourCount.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, [0, 0]);

    const weekdayCount = new Map<string, number>();
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    data.forEach(notification => {
      const [day, month, year] = notification.dateSend.split(' ')[0].split('/');
      const date = new Date(year, month - 1, day);
      const weekday = weekdays[date.getDay()];
      weekdayCount.set(weekday, (weekdayCount.get(weekday) || 0) + 1);
    });

    let maxCount = 0;
    let mostActiveDay = '';

    weekdayCount.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = day;
      }
    });

    this.kpis = {
      pendingRate: (sent / total) * 100,
      viewedRate: (pending / total) * 100,
      dailyAverage: total / uniqueDays,
      mostUsedTemplate: {
        name: mostUsedTemplate[0],
        count: mostUsedTemplate[1]
      },
      peakHour: {
        hour: peakHour[0],
        count: peakHour[1]
      },
      mostFrequentContact: {
        email: mostFrequentContact[0],
        count: mostFrequentContact[1]
      },
      mostActiveDay: {
        day: mostActiveDay,
        count: maxCount,
        percentage: (maxCount / total) * 100
      }
    };
  }

  showInfo() {
    const message = '';

    this.showModal('Información', message);
  }

  showModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  formatResponseTime(hours: number, minutes: number): string {
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  }




  weeklyChartData: ChartData = {
    labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    datasets: [{
      data: [],
      label: 'Notificaciones por Día',
      backgroundColor: 'rgba(149, 160, 217, 1)',
      borderColor: 'rgba(149, 160, 217, 1)',
      borderWidth: 1,
      fill: false
    }]
  };

  subscriptionAnalysisData: ChartData = {
    labels: [], // Nombres de suscripciones
    datasets: [
      {
        data: [], // Cantidad de usuarios suscritos
        label: 'Suscritos',
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1
      },
      {
        data: [], // Cantidad de usuarios desuscritos
        label: 'Desuscritos',
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        borderWidth: 1
      }
    ]
  };

  subscriptionAnalysisOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Análisis de Suscripciones Opcionales'
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: true
        },
        title: {
          display: true,
          text: 'Cantidad de Usuarios'
        },
        border: {
          display: true
        }
      },
      y: {
        stacked: false,
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Tipos de Suscripción'
        },
        border: {
          display: true
        }
      }
    },
    maintainAspectRatio: false
  };
  weeklyChartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Día de la Semana'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cantidad de Notificaciones'
        },
        beginAtZero: true
      }
    }
  };

  
  contactTypeChartData: ChartData = {
    labels: ['Email', 'Teléfono', 'Redes Sociales'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['rgba(255, 171, 145, 1)', 'rgba(144, 202, 249, 1)', 'rgba(188, 170, 164, 1'],
      hoverBackgroundColor: ['rgba(255, 171, 145, 1)', 'rgba(144, 202, 249, 1)', 'rgba(188, 170, 164, 1']
    }]
  };




  private updateWeeklyChartData(data: any[]): void {
    const weekdayCount = new Map<string, number>();
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    data.forEach(notification => {
      const [day, month, year] = notification.dateSend.split(' ')[0].split('/');
      const date = new Date(year, month - 1, day);
      const weekday = weekdays[date.getDay()];
      weekdayCount.set(weekday, (weekdayCount.get(weekday) || 0) + 1);
    });

    this.weeklyChartData.datasets[0].data = weekdays.map(day => weekdayCount.get(day) || 0);

    setTimeout(() => {
      if (this.weeklyChart) {
        this.weeklyChart.update(); // Solo actualiza si el gráfico existe
      }
    });
  }

  // Método para procesar los datos
  processSubscriptionData(contacts: any[], subscriptionTypes: any[]) {
    // Filtrar solo las suscripciones opcionales
    const optionalSubs = subscriptionTypes
      .filter(sub => sub.isUnsubscribable)
      .map(sub => sub.name);

    const subscriptionStats: Record<string, SubscriptionStat> = optionalSubs.reduce((acc, subName) => {
      acc[subName] = { subscribed: 0, unsubscribed: 0, total: contacts.length };
      return acc;
    }, {} as Record<string, SubscriptionStat>);

    // Ahora el sort estará correctamente tipado
    const sortedStats = Object.entries(subscriptionStats)
      .sort(([, a], [, b]) => b.subscribed - a.subscribed);


    // Contar suscripciones
    contacts.forEach(contact => {
      optionalSubs.forEach(subName => {
        if (contact.subscriptions.includes(subName)) {
          subscriptionStats[subName].subscribed++;
        } else {
          subscriptionStats[subName].unsubscribed++;
        }
      });
    });

    // Actualizar datos del gráfico
    this.subscriptionAnalysisData.labels = sortedStats.map(([name]) => name);
    this.subscriptionAnalysisData.datasets[0].data = sortedStats.map(([, stats]) => stats.subscribed);
    this.subscriptionAnalysisData.datasets[1].data = sortedStats.map(([, stats]) => stats.unsubscribed);
  }





  exportDashboardData(): string {
    const data = {
      kpis: this.kpis,
      statusChartData: this.statusChartData,
      templateChartData: this.templateChartData,
      dailyChartData: this.dailyChartData,
      notifications: this.notifications,
    };
    return JSON.stringify(data);
  }


  toggleTooltip() {
    this.isTooltipOpen = !this.isTooltipOpen;
    if (this.isTooltipOpen) {
      this.fetchIaResponse();
    }
  }

  fetchIaResponse() {
    console.log(this.exportDashboardData());
    this.isLoading = true; // Mostrar spinner
    this.iaService.analyzdeDashboard(this.exportDashboardData()).subscribe({
      next: (response) => {
        this.iaResponse = response; // Cambia según el formato de tu API
        this.isLoading = false; // Ocultar spinner
      },
      error: () => {
        this.iaResponse = 'Error al obtener respuesta del asistente.';
        this.isLoading = false;
      }
    });
  }

  loadContactsAndSubscriptions(): void {
    forkJoin({
      subscriptionTypes: this.subscriptionService.getAllSubscriptions(),
      contacts: this.contactService.getAllContacts()
    }).subscribe({
      next: ({ subscriptionTypes, contacts }) => {
        // Actualizar gráfico de tasa de retención (verde)
        const retentionMetrics = this.calculateRetentionMetrics(contacts, subscriptionTypes);
        this.retentionChartData = {
          labels: retentionMetrics.map(m => this.subscriptionService.getSubscriptionNameInSpanish(m.subscriptionName)),
          datasets: [{
            data: retentionMetrics.map(m => m.retentionRate),
            label: 'Tasa de Retención (%)',
            backgroundColor: 'rgba(98, 182, 143, 1)',
            borderColor: 'rgba(98, 182, 143, 1)',
            borderWidth: 1
          }]
        };

        // Actualizar gráfico de análisis (azul/rojo)
        const analysisMetrics = this.calculateSubscriptionAnalysis(contacts, subscriptionTypes);
        this.subscriptionAnalysisData = {
          labels: analysisMetrics.map(m => this.subscriptionService.getSubscriptionNameInSpanish(m.subscriptionName)),
          datasets: [
            {
              data: analysisMetrics.map(m => m.subscribed),
              label: 'Suscritos',
              backgroundColor: 'rgba(130, 177, 255, 1)',
              borderColor: 'rgba(130, 177, 255, 1)',
              borderWidth: 1
            },
            {
              data: analysisMetrics.map(m => m.unsubscribed),
              label: 'Desuscritos',
              backgroundColor: 'rgba(255, 145, 158, 1)',
              borderColor: 'rgba(255, 145, 158, 1)',
              borderWidth: 1
            }
          ]
        };
      },
      error: (error) => {
        console.error('Error loading contacts and subscriptions:', error);
      }
    });
  }

  private calculateRetentionMetrics(contacts: any[], subscriptionTypes: any[]): RetentionMetric[] {
    // Solo para suscripciones opcionales
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
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        retentionRate: (activeUsers / totalUsers) * 100
      };
    });
  }


  retentionChartData: ChartData = {
    labels: [], // Nombres de suscripciones
    datasets: [{
      data: [], // Porcentajes de retención
      label: 'Tasa de Retención (%)',
      backgroundColor: '#4CAF50', // Verde
      borderColor: '#4CAF50',
      borderWidth: 1
    }]
  };

  retentionChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Tasa de Retención de Notificaciones Opcionales'
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Porcentaje de Retención'
        }
      }
    }
  };

  private updateRetentionChart(metrics: any[]) {
    this.retentionChartData = {
        labels: metrics.map(m => this.subscriptionService.getSubscriptionNameInSpanish(m.subscriptionName)),
        datasets: [{
            data: metrics.map(m => m.retentionRate),
            label: 'Tasa de Retención (%)',
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 1
        }]
    };
}

  private calculateRetentionKPIs(metrics: RetentionMetric[]): RetentionKPIs {
    return {
      averageRetention: metrics.reduce((acc, m) => acc + m.retentionRate, 0) / metrics.length,
      highestRetention: metrics[0].subscriptionName,
      lowestRetention: metrics[metrics.length - 1].subscriptionName,
      subscriptionsAbove80: metrics.filter(m => m.retentionRate > 80).length
    };
  }

  processRetentionData(contacts: any[], subscriptionTypes: any[]) {
    // Para los KPIs y el gráfico de tasa de retención (verde)
    const retentionMetrics = this.calculateRetentionMetrics(contacts, subscriptionTypes);
    this.retentionKPIs = this.calculateRetentionKPIs(retentionMetrics);
    this.updateRetentionChart(retentionMetrics);

    // Para el gráfico de análisis (azul/rojo)
    const analysisMetrics = this.calculateSubscriptionAnalysis(contacts, subscriptionTypes);
    this.updateSubscriptionAnalysisChart(analysisMetrics);
}

private calculateSubscriptionAnalysis(contacts: any[], subscriptionTypes: any[]) {
  const optionalSubs = subscriptionTypes
    .filter(sub => sub.isUnsubscribable)
    .map(sub => sub.name);

  return optionalSubs.map(subName => {
    const subscribedUsers = contacts.filter(contact =>
      contact.subscriptions.includes(subName)
    ).length;

    return {
      subscriptionName: subName,
      subscribed: subscribedUsers,
      unsubscribed: contacts.length - subscribedUsers
    };
  });
}

  private updateSubscriptionAnalysisChart(metrics: any[]) {
    this.subscriptionAnalysisData = {
        labels: metrics.map(m => this.subscriptionService.getSubscriptionNameInSpanish(m.subscriptionName)),
        datasets: [
            {
                data: metrics.map(m => m.subscribed),
                label: 'Suscritos',
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
                borderWidth: 1
            },
            {
                data: metrics.map(m => m.unsubscribed),
                label: 'Desuscritos',
                backgroundColor: '#FF6384',
                borderColor: '#FF6384',
                borderWidth: 1
            }
        ]
    };
}


}
