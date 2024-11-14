import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { DashBoardFilters, graphModel, kpiModel } from '../../models/dashboard.model';
import { StadisticsService } from '../../services/stadistics.service';
import { KpiComponent } from '../commons/kpi/kpi.component';
import { BarchartComponent } from '../commons/barchart/barchart.component';
import { PiechartComponent } from '../commons/piechart/piechart.component';
import { graphModel, kpiModel, PeriodRequest, TopPayments } from '../../models/stadistics';
import Period from '../../../expenses/models/period';
import { filter } from 'rxjs';
import { PaymentReportDto } from '../../models/payments.report.model';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [KpiComponent, BarchartComponent, PiechartComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent {
  @Input() filters: PeriodRequest = {} as PeriodRequest;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  // typeDictionary = VisitorTypeAccessDictionary;

  //vars
  kpi1: kpiModel = {} as kpiModel
    kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel
  graph2: graphModel = {} as graphModel

  //Para graficos

  //redirect
  sendNotification(mode: string) {
    this.notifyParent.emit(mode);
  }
  //init
  constructor(private stadisticsService: StadisticsService) {
    this.kpi1 = {title: "Tasa de cobros existos", desc: "", value: "0", icon: "", color: "bg-success"}
    this.kpi2 = {title: "Aprobados vs Pendientes", desc: "", value: "0%", icon: "bi bi-graph-up", color: "bg-info"}
    this.kpi3 = {title: "Tiempo promedio de pagos", desc: "Tipo más frecuente en el periodo", value: "0", icon: "bi bi-person-circle", color: "bg-warning"}

    this.graph1 = {title: "Informe de total cobrado", subtitle: "", data: [], options: null}
    this.graph2 = {title: "Deuda total de propietarios", subtitle: "", data: [], options: null}
  }

   //getData
   async getData() {
    let action = this.filters.paymentMethod == "TRANSFER" ? "Transferencia" : "Mercado Pago"
    this.kpi1.icon = "bi bi-arrow-down-circle"
    this.kpi1.color = "bg-success"
    this.kpi1.title = "Tasa de cobros exitosos con " + action
    this.kpi2.title = "Pendiente y aprobados"
    this.kpi1.desc = "Suma total de " + action.toLowerCase() + " en el periodo actual vs. anterior"
    this.kpi3.desc = "Tipo de " + action.toLowerCase() + " más frecuente en el periodo"
    this.kpi3.title = "Tipo de " + action.toLowerCase() + " Más Frecuente"
    this.graph1.title = "Totales de " + action + " por Periodo"

    this.graph2.options = {...this.columnChartOptions,
      colors: ['#ffc107']}
    this.graph2.options.width = null;
    this.graph2.options.height = 200;

    //tasa de pagos
    this.getReportDinamicFilters();
  }

  getReportDinamicFilters(): void {
    console.log("FILTOROOOOS" +this.filters);

    this.stadisticsService.getDinamycFilters(this.filters).subscribe(
      (data: PaymentReportDto[]) => {
        let countMP = 0;
        let countT = 0;

        let countPending = 0;
        let countApproved = 0;

        for (const payment of data) {
          if (payment.paymentMethod === 'MERCADO_PAGO') {
            countMP++;
          } else if (payment.paymentMethod === 'TRANSFERENCE') {
            countT++;
          }if(payment.status === 'REJECTED'){
            console.log("REJECTED", countPending);
            countPending++;
        } else if (payment.status === 'APPROBED'){
            countApproved++;
        }

        if(payment.amount > 0){
          this.graph1.data.push([payment.createdAt, payment.amount]);
        }
      }

        this.kpi1.value = countMP + " vs. " + countT;
        this.kpi2.value = countPending + " - " + countApproved;
      },
      (error: any) => {
        console.error('Error al obtener el reporte', error);
      }
    );
  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '80%', height: '60%'},
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
      showTextEvery: 2,
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: '100%',
    bar: {groupWidth: '70%'}
  };

  pieChartOptions = {
    backgroundColor: 'transparent',
    legend: {
      position: 'right-center',
      textStyle: { color: '#6c757d', fontSize: 17 }
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: '80%',
    slices: {
      0: { color: '#00BFFF' },  // MP siempre azul
      1: { color: '#8A2BE2' },  // STRIPE siempre violeta
      2: { color: '#ACE1AF' }   // EFECTIVO siempre verde
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 18
    }
  };

  ngAfterViewInit(): void {
  //  this.getData()
  }


}


function createPreviousFilter(filters: PeriodRequest): PeriodRequest {
  const dateFrom = new Date(filters.startCreatedAt);
  const dateTo = new Date(filters.endCreatedAt);

  const diffInDays = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24);

  const newDateTo = dateFrom;
  const newDateFrom = new Date(dateFrom);
  newDateFrom.setDate(newDateFrom.getDate() - diffInDays);

  return {
    startCreatedAt: newDateFrom.toISOString(),
    endCreatedAt: newDateTo.toISOString(),
    status: filters.status,
    paymentMethod: filters.status
  };
}

function mapColumnData(array:any[]) : any{
  return array.map(data => [
    data.key,
    data.value || 0
  ]);
}

function translateTable(value: any, dictionary: { [key: string]: any }) {
  if (value !== undefined && value !== null) {
    for (const key in dictionary) {
      if (dictionary[key] === value) {
        return key;
      }
    }
  }
  console.log("Algo salio mal.");
  return;
}
//tenia dashResponse en lugar de any
function mapColumnDataT(array:any[], dictionary:any ) : any{
  return array.map(data => [
    translateTable(data.key, dictionary),
    data.value || 0
  ]);
}
