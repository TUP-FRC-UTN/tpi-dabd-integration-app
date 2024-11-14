import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { DashBoardFilters } from '../../models/dashboard.model';
import { graphModel, kpiModel, PeriodRequest, TicketInfo } from '../../models/stadistics';
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


    this.getPeriodAmount(this.filters);
  }

  // Se obtienen los totales cobrados en cada periodo para el gráfico de comparación
  getPeriodAmount(periodRequest: PeriodRequest): void {
    console.log('PeriodRequest ', periodRequest);

    this.stadistictsService.getAmountByDate(periodRequest).subscribe(
      (data: TicketInfo[]) => {
        console.log('Respuesta ', data);
        this.PeriodAmount = data; // Asignamos el array recibido a PeriodAmount
        console.log('PeriodAmount ', this.PeriodAmount);
        this.graph1.data = mapColumnData(this.PeriodAmount);
        this.graph1.options = {
          ...this.columnChartOptions,
          //colors: '#9d0208'
        }
      },
      error => {
        console.error('Error al obtener el reporte', error);
      }
    );
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
function mapColumnData(array: TicketInfo[]): any {
  return array.map(data => [
    data.period,
    data.totalAmount || 0
  ]);
}
