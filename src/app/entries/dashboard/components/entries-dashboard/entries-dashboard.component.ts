import {AfterRenderRef, AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import { DashBoardFilters, graphModel, kpiModel } from '../../../models/dashboard/dashboard.model';
import { DashboardService, dashResponse } from '../../../services/dashboard/dashboard.service';


@Component({
  selector: 'app-entries-dashboard',
  standalone: true,
  imports: [
    BarchartComponent,
    KpiComponent
  ],
  templateUrl: './entries-dashboard.component.html',
  styleUrl: './entries-dashboard.component.css'
})
export class EntriesDashboardComponent implements OnInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = "";

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel

  ngOnInit(): void {
    this.getData()
  }

  constructor(private dashBoardService: DashboardService) {
    this.kpi1 = { title: " en el periodo", desc: "", value: "0", icon: "", color: "" }
    this.kpi2 = { title: "Promedio diario", desc: "", value: "0", icon: "bi bi-calculator", color: "bg-warning" }
    this.kpi3 = { title: "Periodo más concurrido", desc: "", value: "0", icon: "bi bi-calendar-event", color: "bg-info" }

    this.graph1 = {title: "Ingresos/egresos", subtitle: "Totales por periodo seleccionado", data: [], options: null}
  }

  getData() {
    let action = this.filters.action == "ENTRY" ? "Ingresos" : "Egresos"
    this.title = action;
    this.graph1.title = action + " totales"
    this.kpi1.title = action + " totales"
    this.kpi1.icon = this.filters.action == "ENTRY" ? "bi bi-arrow-up-circle" : "bi bi-arrow-down-circle"
    this.kpi1.color = this.filters.action == "ENTRY" ? "bg-success" : "bg-danger"

    this.columnChartOptions.hAxis.showTextEvery = this.filters.group == "WEEK" ? 2 : 3
    this.columnChartOptions.hAxis.showTextEvery = this.filters.group == "MONTH" || this.filters.group == "YEAR" ? 1 : 3

    //obtener filtro
    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      this.graph1.data = mapColumnData(data)
      this.graph1.options = {
        ...this.columnChartOptions,
        colors: [this.filters.action == 'ENTRY' ? '#a2d9a5' : '#ff919e']
      }
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });
      this.kpi2.value = (totalValue1 / data.length).toFixed(2)
      this.kpi1.value = totalValue1.toString();

      let maxValueResponse = data[0];
      for (let i = 1; i < data.length; i++) {
        if (parseFloat(data[i].value) > parseFloat(maxValueResponse.value)) {
          maxValueResponse = data[i];
        }
      }

      // Convertir maxValueResponse.key a formato dd/MM/yyyy


      this.kpi3.value = formatDate(maxValueResponse.key);



    })
  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    chartArea: { width: '100%', height: '90%' },
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12  // Tamaño de fuente más pequeño
      },
      // Formato personalizado para mostrar los valores en miles
      format: '#',
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      showTextEvery: 2
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: 650,
    bar: { groupWidth: '70%' }
  };

  back() {
    this.notifyParent.emit("ALL");
  }


}

function formatDate(key: string): string {
  let formattedDate: string = '';

  if (/^\d{4}$/.test(key)) {
    formattedDate = key;
  } else if (/^\d{4}-\d{2}$/.test(key)) {
    const [year, month] = key.split('-');
    formattedDate = `${month}/${year}`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    const [year, month, day] = key.split('-');
    formattedDate = `${day}/${month}/${year}`;
  } else {
    throw new Error("Formato de fecha no válido");
  }

  return formattedDate;
}

function mapColumnData(array: dashResponse[]): any {
  return array.map(data => [
    formatDate(data.key),
    data.value || 0
  ]);

}
