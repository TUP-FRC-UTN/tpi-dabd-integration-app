import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { DashBoardFilters } from '../../models/dashboard.model';
import { graphModel, kpiModel, PeriodRequest, TicketInfo, TicketInfo2 } from '../../models/stadistics';
import { StadisticsService } from '../../services/stadistics.service';
import { KpiComponent } from '../commons/kpi/kpi.component';
import { BarchartComponent } from '../commons/barchart/barchart.component';

@Component({
  selector: 'app-total-payments',
  standalone: true,
  imports: [
    KpiComponent,
    BarchartComponent
  ],
  templateUrl: './total-payments.component.html',
  styleUrl: './total-payments.component.scss'
})
export class TotalPaymentsComponent {
  @Input() filters: PeriodRequest = {} as PeriodRequest;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = "";

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel

  PeriodAmount: TicketInfo[] = [];

  ngAfterViewInit(): void {
  }

  constructor(private stadistictsService: StadisticsService) {
    this.kpi1 = {title: " en el periodo", desc: "", value: "0", icon: "", color: ""}
    this.kpi2 = {title: "Promedio diario", desc: "", value: "0", icon: "bi bi-calculator", color: "bg-warning"}
    this.kpi3 = {title: "Periodo más concurrido", desc: "", value: "0", icon: "bi bi-calendar-event", color: "bg-info"}

    this.graph1 = {title: "Ingresos/egresos", subtitle: "Ingresos perdiodo y metodo de pago seleccionado", data: [], options: null}
  }

  async getData() {
    let action = this.filters.paymentMethod == "TRANSFER" ? "Transferencia" : "Mercado Pago"
    this.title = action;
    this.graph1.title = "Ingresos por: " + action
    this.kpi1.title = action + " totales"
    this.kpi1.icon = "bi bi-arrow-up-circle"
    this.kpi1.color = "bg-success"

    // this.columnChartOptions.hAxis.showTextEvery = this.filters.group == "WEEK" ? 2 : 3
    // this.columnChartOptions.hAxis.showTextEvery = this.filters.group == "MONTH" || this.filters.group == "YEAR" ? 1 : 3
   // await this.getPeriodAmount(this.filters);
    await this.loadInvoicesByPeriod();


  }

  //Se obtienen los totales cobrados en cada periodo para el grafico de comparacion
  getPeriodAmount(periodRequest: PeriodRequest): Promise<void> {
    console.log('PeriodRequest ',periodRequest)
    return new Promise((resolve, reject) => {
      this.stadistictsService.getAmountByDate(periodRequest).subscribe(
        (data: TicketInfo[]) => {
          console.log('Respuesta ',data)
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


    //Se configura y cargan los graficos para la comparacion de ingresos
  loadInvoicesByPeriod(): void {
    // Verificar que top5Data y top5Data.top5 están definidos
    if (!this.PeriodAmount) return;

    // Extraer etiquetas (números de ticket) y valores (monto total) para el gráfico
    const labels = this.PeriodAmount.map((item: TicketInfo) => item.period);
    const values = this.PeriodAmount.map((item: TicketInfo) => item.totalAmount);

    const data: TicketInfo2[] = [
      { period: 'Enero', totalAmount: 120 },
      { period: 'Febrero', totalAmount: 150 },
      { period: 'Marzo', totalAmount: 100 },
      { period: 'Abril', totalAmount: 180 },
      { period: 'Mayo', totalAmount: 90 }
    ];

    this.graph1.data = mapColumnData(data);

  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '100%', height: '90%'},
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12  // Tamaño de fuente más pequeño
      },
      // Formato personalizado para mostrar los valores en miles
      format: '#',
    },
    hAxis: {
      textStyle: {color: '#6c757d'},
      showTextEvery: 2
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: 900,
    bar: {groupWidth: '70%'}
  };

  back() {
    this.notifyParent.emit("ALL");
  }


}

// Función mapColumnData que transforma el arreglo
function mapColumnData(array: TicketInfo2[]): any {
  return array.map(data => [
    data.period,
    data.totalAmount || 0
  ]);
}
