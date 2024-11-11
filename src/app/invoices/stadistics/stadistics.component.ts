import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { InfoComponent } from '../info/info.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StadisticsService } from '../services/stadistics.service';
import { OtherReport, PeriodRequest, TicketInfo, Top5 } from '../models/stadistics';

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
  resumenIngresos: number = 0;
  promedioMensual: number = 0;

  metodosPago: number = 0;
  metodoPrincipal: string = 'MercadoPago';
  porcentajeMetodoPrincipal: number = 0;

  boletaMasAlta: number = 0;
  promedioTop5: number = 0;

  mercadoPagoPromedio: number = 0;
  porcentajeTransacciones: number = 0;

  cantidadAprobados: number = 0;
  cantidadPendientes: number = 0;
  cantidadCancelados: number = 0;

  // Variables para enviar la request y carguen los datos al service
  dateForm: FormGroup;

  //variables para guardar la info de los reportes
  BaseReport!: Top5;
  OtherReports!: OtherReport;
  PeriodAmount: TicketInfo[] = [];
  public chartData: any;
  public chartDataPeriodsAmount: any;


  constructor(private fb: FormBuilder, private modalService: NgbModal, private stadisticsService: StadisticsService) {
    this.dateForm = this.fb.group({
      startDate: ['2024-01', Validators.required],  // Fecha por defecto para 'Periodo Desde'
      endDate: ['2024-09', Validators.required]     // Fecha por defecto para 'Periodo Hasta'
    });
  }

  ngOnInit(): void {
    this.buscar();
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
          'rgba(255, 193, 7, 0.2)',  // Pendiente - amarillo
          'rgba(25, 135, 84, 0.2)',  // Pagado - verde
          'rgba(220, 53, 69, 0.2)'   // Anulado - rojo
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',    // Pendiente
          'rgba(25, 135, 84, 1)',    // Pagado
          'rgba(220, 53, 69, 1)'     // Anulado
        ],
        borderWidth: 1
      }
    ]
  };

  // Configuración del gráfico de torta para "Distribucion pagos"
  public doughnutChartPaymentDistribution: ChartData<'pie'> = {
    labels: ['Transferencia', 'Mercado Pago'],
    datasets: [
      {
        data: [], // Cantidad de pagos por estado
        backgroundColor: [
          'rgba(255, 193, 7, 0.2)',  // Pendiente - amarillo
          'rgba(13, 110, 253, 0.2)'  // Pagado - verde
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',    // Pendiente
          'rgba(13, 110, 253, 1)'    // Pagado
        ],
        borderWidth: 1
      }
    ]
  };

  // Buscador que carga los filtros de fechas
  async buscar() {

    const fechas = this.dateForm.value;
    const periodRequest: PeriodRequest = {
      firstDate: this.formatMonthYear(fechas.startDate),
      lastDate: this.formatMonthYear(fechas.endDate)
    };

    //Se realizan las consultas para obtener datos
    await this.getReportDataTop5(periodRequest);
    await this.getOtherReport(periodRequest);
    await this.getPeriodAmount(periodRequest);

    // Se actualizan los graficos con los nuevos datos
    this.loadInvoicesByPeriod();
    this.loadTop5Invoices();
    this.updateStatusChart();
    this.chart?.update();
    this.loadCardData();
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

  //Aqui se cargan los datos para las card de la izq
  loadCardData() {
    this.resumenIngresos = parseInt(this.OtherReports.totalPaid.toString(), 10);
    this.promedioMensual = this.OtherReports.totalAveragePaid;

    this.metodosPago = parseInt(this.OtherReports.paid.toString(), 10);
    this.metodoPrincipal = 'MercadoPago';
    this.porcentajeMetodoPrincipal = 0;

    this.boletaMasAlta = this.BaseReport.topAmount;
    this.promedioTop5 = parseInt(this.BaseReport.averageAmount.toString(), 10);

    this.mercadoPagoPromedio = 0;
    this.porcentajeTransacciones = 0;

    this.cantidadAprobados = this.OtherReports.paid;
    this.cantidadPendientes = this.OtherReports.pending;
    this.cantidadCancelados = this.OtherReports.canceled;
  }

  getReportDataTop5(periodRequest: PeriodRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stadisticsService.getBaseReport(periodRequest).subscribe(
        (data: Top5) => {
          this.BaseReport = data;
          resolve();
        },
        error => {
          console.error('Error al obtener el reporte', error);
          reject(error);
        }
      );
    });
  }

  getOtherReport(periodRequest: PeriodRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stadisticsService.getOtherReport(periodRequest).subscribe(
        (data: OtherReport) => {
          this.OtherReports = data;
          resolve();
        },
        error => {
          console.error('Error al obtener el reporte', error);
          reject(error);
        }
      );
    });
  }

  //Se obtienen los totales cobrados en cada periodo para el grafico de comparacion
  getPeriodAmount(periodRequest: PeriodRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stadisticsService.getAmountByDate(periodRequest).subscribe(
        (data: TicketInfo[]) => {
          this.PeriodAmount = data; // Asignamos el array recibido a PeriodAmount
          resolve();
        },
        error => {
          console.error('Error al obtener el reporte', error);
          reject(error);
        }
      );
    });
  }

  formatMonthYear(dateString: string): string {
    const [year, month] = dateString.split('-');
    return `${month}/${year.slice(2)}`; // Formato "MM/YY" para la API
  }

  updateStatusChart(){
    this.doughnutChartData = {
      labels: ['Pendiente', 'Pagado', 'Anulado'],
      datasets: [
        {
          data: [this.OtherReports.pending,
                this.OtherReports.paid,
                this.OtherReports.canceled],
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
  }

  loadTop5Invoices(): void {
    // Verificar que top5Data y top5Data.top5 están definidos
    if (!this.BaseReport || !this.BaseReport.top5) return;

    // Extraer etiquetas (números de ticket) y valores (monto total) para el gráfico
    const labels = this.BaseReport.top5.map((item: TicketInfo) => item.lot);
    const values = this.BaseReport.top5.map((item: TicketInfo) => item.totalAmount);

    console.log(this.BaseReport);
    // Configurar los datos del gráfico
    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Gastos en $',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  //Se configura y cargan los graficos para la comparacion de ingresos
  loadInvoicesByPeriod(): void {
    // Verificar que top5Data y top5Data.top5 están definidos
    if (!this.PeriodAmount) return;

    // Extraer etiquetas (números de ticket) y valores (monto total) para el gráfico
    const labels = this.PeriodAmount.map((item: TicketInfo) => item.period);
    const values = this.PeriodAmount.map((item: TicketInfo) => item.totalAmount);

    // Configurar los datos del gráfico
    this.chartDataPeriodsAmount = {
      labels: labels,
      datasets: [
        {
          label: 'Monto de expensas cobradas en el mes',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  onDateChange() {
    if (this.dateForm.valid) {
      this.buscar(); // Llamar a la función buscar cuando las fechas son válidas
    }
  }

  //Se cofigura las properties para el grafico TOP 5
  public barChartOptionsHorizontal: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {

      }
    }
  };

}
