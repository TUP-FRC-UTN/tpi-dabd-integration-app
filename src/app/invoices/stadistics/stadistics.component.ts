import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent implements OnInit {
  // Configuración del gráfico de barras para "Cantidad de Pagos por Día"
  public barChartData: ChartData<'bar'> = {
    labels: [], // Fechas
    datasets: [
      {
        label: 'Cantidad de Pagos por Día',
        data: [], // Cantidad de pagos para cada día
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  public pieChartType: ChartType = 'pie'; 
  // Opciones del gráfico de barras
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true
      }
    }
  };

  // Configuración del gráfico de torta para "Estado de Pagos"
  public doughnutChartData: ChartData<'pie'> = {
    labels: ['Pendiente', 'Pagado', 'Anulado'],
    datasets: [
      {
        data: [], // Cantidad de pagos por estado
        backgroundColor: [
          'rgba(255, 206, 86, 0.2)',  // Pendiente - amarillo
          'rgba(75, 192, 192, 0.2)',  // Pagado - verde
          'rgba(255, 99, 132, 0.2)'   // Anulado - rojo
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',    // Pendiente
          'rgba(75, 192, 192, 1)',    // Pagado
          'rgba(255, 99, 132, 1)'     // Anulado
        ],
        borderWidth: 1
      }
    ]
  };



  constructor() {}

  ngOnInit(): void {
    this.loadPaymentData();
    this.loadPaymentStatusData();
  }

  // Simulación de datos para el gráfico de barras
  loadPaymentData() {
    const fechas = ['01/11', '02/11', '03/11', '04/11', '05/11'];
    const pagos = [5, 10, 7, 3, 8];

    this.barChartData.labels = fechas;
    this.barChartData.datasets[0].data = pagos;
  }

  // Simulación de datos para el gráfico de torta
  loadPaymentStatusData() {
    const pendiente = 15;
    const pagado = 30;
    const anulado = 5;

    this.doughnutChartData.datasets[0].data = [pendiente, pagado, anulado];
  }
}