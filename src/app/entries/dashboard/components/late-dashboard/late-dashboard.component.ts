import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {PiechartComponent} from "../../commons/piechart/piechart.component";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import { DashBoardFilters, graphModel, kpiModel } from '../../../models/dashboard/dashboard.model';
import { DashboardService, dashResponse } from '../../../services/dashboard/dashboard.service';


@Component({
  selector: 'app-late-dashboard',
  standalone: true,
  imports: [
    KpiComponent,
   //PiechartComponent,
    BarchartComponent
  ],
  templateUrl: './late-dashboard.component.html',
  styleUrl: './late-dashboard.component.css'
})
export class LateDashboardComponent implements OnInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = "";

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel


  back() {
    this.notifyParent.emit("ALL");
  }

  constructor(private dashBoardService: DashboardService) {}

  getData() {
    let action = this.filters.action == "ENTRY" ? "Egresos" : "Egresos"
    this.title = " egresos tardíos de empleados"
    this.title = " egresos tardios de " + action.toLowerCase()

    this.kpi1.title = "Egresos tardios en el periodo vs el anterior"
    this.kpi1.icon = "bi-exclamation-circle"
    this.kpi1.color = "bg-danger"
    this.kpi1.desc ="Total de egresos tardios en el periodo vs el periodo anterior"

    this.kpi2.title = "Tendencias de egresos tardios"
    this.kpi2.color = this.filters.action == "ENTRY" ? "bg-success" : "bg-danger"
    this.kpi2.desc ="Total de " + action.toLowerCase() + " en el periodo vs el periodo anterior"

    this.kpi3.title ="Periodo con mayor cantidad"
    this.kpi3.color = "bg-info"
    this.kpi3.icon = "bi bi-calendar-event"

    this.graph1.title = action + " totales"


    this.columnChartOptions.hAxis.showTextEvery = this.filters.group == "WEEK" ? 2 : 3
    this.columnChartOptions.hAxis.showTextEvery = this.filters.group == "MONTH" || this.filters.group == "YEAR" ? 1 : 3

    //obtener filtro
    let inconsistenciesFilter = {...this.filters}
    inconsistenciesFilter.dataType= "LATE"
    inconsistenciesFilter.action= ""
    this.dashBoardService.getPeriod(inconsistenciesFilter).subscribe(data => {
      this.graph1.data = mapColumnData(data)
      this.graph1.options = {...this.columnChartOptions,
      }
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });
      let previousFilter = createPreviousFilter(inconsistenciesFilter)
      this.dashBoardService.getPeriod(previousFilter).subscribe(data => {
        let totalValue = 0;
        data.forEach(item => {
          totalValue += Number(item.value);
        });
        this.kpi1.value = totalValue1.toString() + " / " + totalValue.toString();
        let kpi2value = ((totalValue - totalValue1 )/ totalValue1) * 100 == Infinity || Number.isNaN((((totalValue - totalValue1) / totalValue1) * 100)) ? 0 : ((totalValue - totalValue1 )/ totalValue1) * 100;
        this.kpi2.value = kpi2value.toFixed(2) + "%";
        this.kpi2.icon = kpi2value > 0 ? "bi bi-graph-up" : "bi bi-graph-down"
      })

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
    legend: {position: 'none'},
    chartArea: {width: '95%', height: '80%'},
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12
      },
      format: '#',
    },
    colors: ['#e0f59d'],
    hAxis: {
      textStyle: {color: '#6c757d'},
      showTextEvery: 2
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 500,
    width: '650',
    bar: {groupWidth: '70%'}
  };

  ngOnInit(): void {
    this.getData()
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

function mapColumnData(array:dashResponse[]) : any{
  return array.map(data => [
    formatDate(data.key),
    data.value || 0
  ]);
}

function createPreviousFilter(filters: DashBoardFilters): DashBoardFilters {
  const dateFrom = new Date(filters.dateFrom);
  const dateTo = new Date(filters.dateTo);

  const diffInDays = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24);

  const newDateTo = dateFrom;
  const newDateFrom = new Date(dateFrom);
  newDateFrom.setDate(newDateFrom.getDate() - diffInDays);

  return {
    dateFrom: newDateFrom.toISOString(),
    dateTo: newDateTo.toISOString(),
    action: filters.action,
    group: filters.group,
    type: filters.type,
    dataType: "ALL"
  };
}
function formatFormDate(inputDate: string): string {
  // Verificar que la entrada sea una fecha válida en el formato yyyy-MM-dd
  const dateParts = inputDate.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Fecha no válida. Debe estar en formato yyyy-MM-dd');
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  // Devolver la fecha en el formato dd-MM-yyyy
  return `${day}-${month}-${year}`;
}
