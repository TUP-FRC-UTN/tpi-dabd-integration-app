import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { InfoComponent } from '../info/info.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, MainContainerComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Variables cards izquierda
  resumenIngresos: number = 377;
  promedioMensual: number = 385;

  metodosPago: number = 22;
  metodoPrincipal: string = 'MercadoPago';
  porcentajeMetodoPrincipal: number = 40.9;

  boletaMasAlta: number = 20000;
  promedioTop5: number = 18860;

  mercadoPagoPromedio: number = 17144;
  porcentajeTransacciones: number = 40.9;

  // Variables para enviar la request y carguen los datos al service
  dateForm: FormGroup;


  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required, this.endDateValidator.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.loadPaymentData();
    this.loadPaymentStatusData();
  }

   // Validar que la fecha fin sea mayor a fecha inicio
  endDateValidator(control: AbstractControl): { [key: string]: any } | null {
    const startDate = this.dateForm?.get('startDate')?.value;
    const endDate = control.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { endDateInvalid: true };
    }
    return null;
  }
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








  // Buscador que carga los filtros de fechas

  buscar() {

    const fechas = this.dateForm.value

    console.log('Fechas seleccionadas:', fechas);
    const pendiente = 50;
    const pagado = 25;
    const anulado = 25;

    // Asignar un nuevo objeto para forzar la detección de cambios
    this.doughnutChartData = {
      labels: ['Pendiente', 'Pagado', 'Anulado'],
      datasets: [
        {
          data: [pendiente, pagado, anulado],
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
    this.chart?.update();
  }


  // ACA SE ABRE EL MODAL DE INFO
  showInfo(): void {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });

    modalRef.componentInstance.data = { role: 'owner' };
  }
}