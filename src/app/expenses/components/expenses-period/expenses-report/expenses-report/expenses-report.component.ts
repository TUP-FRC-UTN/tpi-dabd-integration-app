import {Component, inject} from '@angular/core';
import {ExpenseServiceService} from "../../../../services/expense.service";
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {PeriodSelectComponent} from "../../../selects/period-select/period-select.component";
import {CommonModule, DatePipe} from '@angular/common';
import {NgPipesModule} from "ngx-pipes";

import {
  Filter,
  FilterOption,
  MainContainerComponent, NumberFilter,
  SelectFilter,
  TableComponent,
  TableFiltersComponent
} from "ngx-dabd-grupo01";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {
  BarController,
  BubbleController,
  ChartData,
  ChartType,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  ChartOptions,
  ChartConfiguration
} from 'chart.js';
import {BaseChartDirective} from "ng2-charts";
import Chart from 'chart.js/auto';
import {BillService} from "../../../../services/bill.service";
import {PeriodService} from "../../../../services/period.service";
import * as XLSX from "xlsx";
import {InfoExpenseReportComponent} from "../../../modals/info-expense-report/info-expense-report.component";


Chart.register(BarController, PieController, RadarController, LineController, PolarAreaController, DoughnutController, BubbleController, ScatterController);
@Component({
  selector: 'app-expenses-report',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, PeriodSelectComponent, TableComponent, NgPipesModule, MainContainerComponent, TableFiltersComponent, BaseChartDirective
  ],
  providers: [DatePipe, NgbActiveModal],
  templateUrl: './expenses-report.component.html',
  styleUrl: './expenses-report.component.css'
})
export class ExpensesReportComponent {

  private readonly periodService = inject(PeriodService)
  total: number | undefined;
  averageAmount: number | undefined;
  totalLotes: number | undefined;
  typesPlots: number | undefined;
  top : boolean = true;
  totalAmountPerTypePlot: Map<String, number>[] | undefined

  modalService = inject(NgbModal);
  menosMayor :number=1
  periods: FilterOption[] = [];
  categories: FilterOption[] = []
  types: FilterOption[]= []
  filterConfig: Filter[] = [
    new SelectFilter('Tipo de Top','lot','Seleccione un tipo de top',this.categories),
    new NumberFilter('Cantidad de lotes para mostrar','count','Seleccione una cantidad'),
    new SelectFilter('Periodos','period','Seleccione un periodo',this.periods)
  ]
  selectedPeriodId: number = 0;
  countPlots: number = 10; //Predefinido 10
  ngOnInit(): void {
    this.loadExpenseData();
    this.loadKpis();
    this.loadSelect();
  }
  loadSelect() {
    this.periodService.get().subscribe((data) => {
      // @ts-ignore
      this.periods.push({value: null, label: 'Todos'})
      data.forEach(item => {
        // @ts-ignore
        this.periods.push({value: item.id, label: item.month + '/' + item.year})
      })
      // @ts-ignore
      this.categories.push({value: 1, label: 'Lotes que mas pagaron'})
      // @ts-ignore
      this.categories.push({value: 2, label: 'Lotes que menos pagaron'})
    })
  }

  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'x',
    plugins: {
      title: {
        display: true,
        text: 'Distribución de Expensas por Lote (en millones)'
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [],
        label: 'Expensas Totales por Lote',
        backgroundColor : [
          'rgba(255,193,7,0.2)',
          'rgba(25,135, 84,0.2)',
          'rgba(220,53, 69,0.2)'
        ],
        borderColor: 'rgba(13,110,253,1)',
        borderWidth: 1,
      }
    ]
  };
  public kpiChartTpe: ChartType = 'pie';
  public kpiChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };
  public kpiChart2Data: ChartData<'pie'> = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['rgba(255, 193, 7, 0.2)',
          'rgba(25, 135, 84, 0.2)',   // Verde
          'rgba(220, 53, 69, 0.2)',   // Rojo
          'rgba(13, 110, 253, 0.2)',  // Azul
          'rgba(123, 31, 162, 0.2)',  // Púrpura
          'rgba(255, 87, 34, 0.2)',   // Naranja
          'rgba(76, 175, 80, 0.2)',   // Verde claro
          'rgba(63, 81, 181, 0.2)',   // Azul índigo
          'rgba(244, 67, 54, 0.2)',   // Rojo claro
          'rgba(0, 150, 136, 0.2)',   // Turquesa
          'rgba(255, 235, 59, 0.2)',  // Amarillo claro
          'rgba(205, 220, 57, 0.2)',  // Lima
          'rgba(158, 158, 158, 0.2)', // Gris
          'rgba(121, 85, 72, 0.2)',   // Café
          'rgba(33, 150, 243, 0.2)'],
        borderColor: 'rgba(13,110,253,1)',
        borderWidth: 1,
      }]

  };
  public kpiChart1Tpe: ChartType = 'line';
  public kpiChart1Options: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Distribución de Expensas por periodo (en millones)'
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
    }
  };
  public kpiChart1Data:  ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['rgba(255, 193, 7, 0.2)',
        'rgba(25, 135, 84, 0.2)',   // Verde
        'rgba(220, 53, 69, 0.2)',   // Rojo
        'rgba(13, 110, 253, 0.2)',  // Azul
        'rgba(123, 31, 162, 0.2)',  // Púrpura
        'rgba(255, 87, 34, 0.2)',   // Naranja
        'rgba(76, 175, 80, 0.2)',   // Verde claro
        'rgba(63, 81, 181, 0.2)',   // Azul índigo
        'rgba(244, 67, 54, 0.2)',   // Rojo claro
        'rgba(0, 150, 136, 0.2)',   // Turquesa
        'rgba(255, 235, 59, 0.2)',  // Amarillo claro
        'rgba(205, 220, 57, 0.2)',  // Lima
        'rgba(158, 158, 158, 0.2)', // Gris
        'rgba(121, 85, 72, 0.2)',   // Café
        'rgba(33, 150, 243, 0.2)'],
      borderColor: 'rgba(13,110,253,1)',
      borderWidth: 1,
    }]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      { data: [],
        backgroundColor : [
          'rgba(255,193,7,0.2)',
          'rgba(25,135, 84,0.2)',
          'rgba(220,53, 69,0.2)'
        ],
        borderColor: 'rgba(13,110,253,1)',
        borderWidth: 1,}
    ],

  };



  service : ExpenseServiceService = inject(ExpenseServiceService);
  titulo: string = "más pagaron";
  periodo: string = "";
  cantidad: number = 10;


  loadKpis() {
    this.service.getExpensesByLot(this.top, this.selectedPeriodId, this.countPlots).subscribe(expenses => {
      if(this.countPlots == 0) {
        this.cantidad = 10
        this.countPlots = 10
      }
      if(this.top == null) {
        this.top = true
      }
      console.log(expenses.totalPlots);
      this.total = Number((expenses.totalAmount / 1000000).toFixed(3));
      this.averageAmount = Number((expenses.averageAmount/1000000).toFixed(3)) ;
      this.totalLotes = expenses.totalPlots;
      this.typesPlots = expenses.typesPlots;
    })
  }

  loadExpenseData(): void {
    if (this.countPlots == 0) {
      this.cantidad = 10
      this.countPlots = 10
    }
    if (this.top == null) {
      this.top = true
    }
    this.service.getExpensesByLot(this.top, this.selectedPeriodId, this.countPlots).subscribe(expenseReport => {

      const lotNumbers = expenseReport.expenses.map(expenseReport => expenseReport.plotNumber).reverse();
      const totalAmounts = expenseReport.expenses.map(expenseReport => Number((expenseReport.totalAmount/1000000).toFixed(3)) );
      // Usar Object.values() y Object.keys() para objetos regulares
      console.log(expenseReport.expenses)
      const valuesArray: number[] = Object.values(expenseReport.totalAmountPerTypePlot).map(num=>num= Number(num/100000)).reverse()
      const labelsArray: string[] = Object.keys(expenseReport.totalAmountPerTypePlot).reverse()
      const valuesArrayLine: number[] = Object.values(expenseReport.totalAmountPerPeriod)
        .map(num => Number(num / 100000))
        .reverse();

      const labelsArrayLine: string[] = Object.keys(expenseReport.totalAmountPerPeriod).reverse();
      // Debug para verificar los datos
      console.log(expenseReport.totalAmountPerPeriod)
      console.log(Object.keys(expenseReport.totalAmountPerPeriod))
      // Reasignar el objeto completo para forzar la detección de cambios
      this.kpiChart1Data = {
        labels: labelsArrayLine,
        datasets: [
          {
            data: valuesArrayLine,
            label: 'Total',
          }
        ]
      }
      this.kpiChart2Data = {
        labels: labelsArray,
        datasets: [
          {
            data: valuesArray,
            backgroundColor: [
              'rgba(220, 53, 69, 0.2)',   // Rojo
              'rgba(13, 110, 253, 0.2)',  // Azul
              'rgba(123, 31, 162, 0.2)',  // Púrpura
              'rgba(255, 87, 34, 0.2)',   // Naranja
              'rgba(76, 175, 80, 0.2)',   // Verde claro
              'rgba(63, 81, 181, 0.2)',   // Azul índigo
              'rgba(244, 67, 54, 0.2)',   // Rojo claro
              'rgba(0, 150, 136, 0.2)',   // Turquesa
              'rgba(255, 235, 59, 0.2)',  // Amarillo claro
              'rgba(205, 220, 57, 0.2)',  // Lima
              'rgba(158, 158, 158, 0.2)', // Gris
              'rgba(121, 85, 72, 0.2)',   // Café
              'rgba(33, 150, 243, 0.2)',
              'rgba(255, 193, 7, 0.2)',   // Amarillo
              'rgba(25, 135, 84, 0.2)',   // Verde

            ],
            borderColor: 'rgba(13,110,253,1)',
            borderWidth: 1,
          }
        ]
      }
      this.barChartData = {
        labels: lotNumbers,
        datasets: [
          {
            data: totalAmounts, label: 'Distribución de Expensas por Lote',
            backgroundColor: [
              'rgba(255, 193, 7, 0.2)',   // Amarillo
              'rgba(25, 135, 84, 0.2)',   // Verde
              'rgba(220, 53, 69, 0.2)',   // Rojo
              'rgba(13, 110, 253, 0.2)',  // Azul
              'rgba(123, 31, 162, 0.2)',  // Púrpura
              'rgba(255, 87, 34, 0.2)',   // Naranja
              'rgba(76, 175, 80, 0.2)',   // Verde claro
              'rgba(63, 81, 181, 0.2)',   // Azul índigo
              'rgba(244, 67, 54, 0.2)',   // Rojo claro
              'rgba(0, 150, 136, 0.2)',   // Turquesa
              'rgba(255, 235, 59, 0.2)',  // Amarillo claro
              'rgba(205, 220, 57, 0.2)',  // Lima
              'rgba(158, 158, 158, 0.2)', // Gris
              'rgba(121, 85, 72, 0.2)',   // Café
              'rgba(33, 150, 243, 0.2)'

            ],
            borderColor: 'rgba(13,110,253,1)',
            borderWidth: 1,
          }
        ]
      }
    });
  }

  /**
   * boton info
   */
  showInfo() {
    this.modalService.open(InfoExpenseReportComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });
  }


  downloadTable() {
    this.service.getExpensesByLot( true, this.selectedPeriodId, this.countPlots).subscribe(expenses => {
      const data = expenses.expenses.map(expense => ({
        'Periodo':  `${expense?.period?.month} / ${expense?.period?.year}`,
        'Monto Total': expense.totalAmount,
        'Numero de lote': expense.plotNumber,
      }));
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      // Convertir los datos tabulares a una hoja de cálculo
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
      XLSX.writeFile(wb,  'Top de montos Fecha: ' + formattedDate + '.xlsx');
  })
  }
  filterChange($event: Record<string, any>) {
    this.selectedPeriodId = $event['period'] || null;
    this.countPlots = $event['count']
    this.cantidad = this.countPlots;
    this.menosMayor = $event['lot'] || null;
    if(this.menosMayor == 1) {
      this.top = true;
      this.titulo = "más pagaron"
    } else {
      this.top = false
      this.titulo = "menos pagaron"
    }
    if(this.countPlots < 0) {
      alert("Debe ingresar una cantidad de lotes valida")
      return;
    }
    this.loadExpenseData()
    this.loadKpis()
  }
}
