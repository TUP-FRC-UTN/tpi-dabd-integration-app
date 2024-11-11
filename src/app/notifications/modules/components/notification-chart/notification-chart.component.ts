import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { NotificationModelChart } from '../../../models/notifications/notification';
import { ChartConfigurationService } from '../../../services/chart-configuration.service';
import { KPIModel } from '../../../models/kpi/kpiModel';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { IaService } from '../../../services/ia-service';
import { ChartData } from 'chart.js';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-notification-chart',
  standalone: true,
  imports: [
    NgChartsModule,
    FormsModule,
    CommonModule,
    MainContainerComponent,
    RouterModule
  ],
  templateUrl: './notification-chart.component.html',
  styleUrl: './notification-chart.component.css'
})


export class NotificationChartComponent implements OnInit {

  @ViewChild('statusChart') statusChart?: BaseChartDirective;
  @ViewChild('templateChart') templateChart?: BaseChartDirective;
  @ViewChild('dailyChart') dailyChart?: BaseChartDirective;
  @ViewChild('weeklyChart') weeklyChart?: BaseChartDirective;

  
  private platformId = inject(PLATFORM_ID);
  notificationService = inject(NotificationService);
  chartConfigurationService = inject(ChartConfigurationService);
  isBrowser = isPlatformBrowser(this.platformId);
  iaService = inject(IaService);

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


  isTooltipOpen = false; 
  isLoading = false;
  iaResponse = ''; 
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  kpis!: KPIModel;

  notifications: NotificationModelChart[] = []

  ngOnInit() {
    this.getAllNotifications(); // Carga de datos inicial
  
    this.notificationService.getAllNotificationsNotFiltered().subscribe((data) => {
      this.notifications = data;
  
      // Asegurate de que los gráficos se actualizan después de cargar los datos.
      if (this.isBrowser) {
        this.filterAndUpdateCharts();
      }
    });
  }


  getAllNotifications() {

    this.notificationService.getAllNotificationsNotFiltered().subscribe((data) => {

      this.notifications = data;

    })

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
    this.filterAndUpdateCharts();
  }

private filterAndUpdateCharts(): void {
  let filteredData = [...this.notifications];

  // Filtros existentes
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

  if (this.dateFrom || this.dateUntil) {
    filteredData = this.notifications.filter(notification => {
      const notificationDate = new Date(this.convertToISODate(notification.dateSend));
      const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
      const untilDate = this.dateUntil ? new Date(this.dateUntil) : null;

      return (!fromDate || notificationDate >= fromDate) &&
        (!untilDate || notificationDate <= untilDate);
    });
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
    const mostUsedTemplate = Array.from(templateCount.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);

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
      backgroundColor: '#FF6384',
      borderColor: '#FF6384',
      borderWidth: 1,
      fill: false
    }]
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


}
