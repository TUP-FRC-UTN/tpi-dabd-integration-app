import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartConfigurationService {


  public commonOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  public statusChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Enviados', 'Visualizados' /*, 'No Leída'*/],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['rgba(187, 131, 209, 1)', 'rgba(220, 231, 117, 1)', '#FFCE56']
    }]
  };


  public statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      }
    }
  };

  public templateChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Cantidad de Usos',
      backgroundColor: '#36A2EB'
    }]
  };


  public templateChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 4,
          precision: 0
        },
        grid: {
          color: '#e9ecef'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  public dailyChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Notificaciones Enviadas',
      fill: false,
      tension: 0.1,
      borderColor: '#36A2EB',
      backgroundColor: '#36A2EB',
      pointBackgroundColor: '#36A2EB',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#36A2EB'
    }]
  };

  public dailyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        },
        grid: {
          color: '#e9ecef'
        }
      },
      x: {
        grid: {
          color: '#e9ecef'
        }
      }
    }
  };

  


}
