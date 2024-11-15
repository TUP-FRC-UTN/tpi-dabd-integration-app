import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ExpenseServiceService } from '../../../services/expense.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PeriodSelectComponent } from '../../selects/period-select/period-select.component';
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
  CurrencyPipe,
} from '@angular/common';
import {
  ChartConfiguration,
  ChartData,
  ChartEvent,
  ChartOptions,
  ChartType,
  Title,
} from 'chart.js';

import { NgPipesModule } from 'ngx-pipes';
import { Chart, registerables } from 'chart.js';
import {
  TableColumn,
  TableComponent,
  ConfirmAlertComponent,
  MainContainerComponent,
  ToastService,
  TableFiltersComponent,
  Filter,
  FilterConfigBuilder,
  FilterOption,
  SelectFilter,
  RadioFilter,
} from 'ngx-dabd-grupo01';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Expense from '../../../models/expense';
import { BaseChartDirective } from 'ng2-charts';
import { ReportPeriodService } from '../../../services/report-period/report-period.service';
import { forkJoin, Observable } from 'rxjs';
import { ReportPeriod } from '../../../models/report-period/report-period';
import Period from '../../../models/period';
import { PeriodService } from '../../../services/period.service';
import { CategoryData } from '../../../models/report-period/category-data';
import { Periods } from '../../../models/charge';
import { Resume } from '../../../models/report-period/resume';
import { SupplierDTO } from '../../../models/report-period/SupplierDTO';
import { SupplierAmount } from '../../../models/report-period/SupplierAmount';
import * as XLSX from 'xlsx';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ExpensesPeriodsGraphicBarComponent } from './expenses-periods-graphic-bar/expenses-periods-graphic-bar.component';
import { ExpensesCategoryGraphicComponent } from './expenses-category-graphic/expenses-category-graphic.component';
@Component({
  selector: 'app-expenses-report',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgPipesModule,
    MainContainerComponent,
    TableFiltersComponent,
    NgSelectComponent,
    ExpensesPeriodsGraphicBarComponent,
    ExpensesCategoryGraphicComponent
  ],
  providers: [DatePipe, NgbActiveModal, CurrencyPipe, DecimalPipe],
  templateUrl: './expenses-period-report.component.html',
  styleUrl: './expenses-period-report.component.css',
})
export class ExpensesPeriodReportComponent implements OnInit {
  private reportPeriodService = inject(ReportPeriodService);
  private periodService = inject(PeriodService);
  private toastService = inject(ToastService);
  meses = [
    { nombre: 'Enero', numero: 1 },
    { nombre: 'Febrero', numero: 2 },
    { nombre: 'Marzo', numero: 3 },
    { nombre: 'Abril', numero: 4 },
    { nombre: 'Mayo', numero: 5 },
    { nombre: 'Junio', numero: 6 },
    { nombre: 'Julio', numero: 7 },
    { nombre: 'Agosto', numero: 8 },
    { nombre: 'Septiembre', numero: 9 },
    { nombre: 'Octubre', numero: 10 },
    { nombre: 'Noviembre', numero: 11 },
    { nombre: 'Diciembre', numero: 12 }
  ];
  form = new FormGroup({
    mes: new FormControl(),
    anio: new FormControl()
  });
    reportPeriod: ReportPeriod | undefined;

  periodos: Period[] = [];
  filters: Filter[] = [];

  ordinaryData: { category: string; percentage: number }[] = [];
  extraordinaryData: { category: string; percentage: number }[] = [];

  periodsFilter: FilterOption[] = [];
  lotss: FilterOption[] = [];
  types: FilterOption[] = [];

  //lista principal del select
  periodsList: Period[] = [];
  filterConfig: Filter[] = [];

  //copia para las cards
  listPeriodFind: Period[] = [];
  expenses: Expense[] = [];
  searchTerm: string = '';
  chartInstances: any[] = [];
  resumeReportOrdinary: any;
  resumeReportExtraordinary: any;
  typeFilter:  "Monto" | "Promedio" | "Porcentaje" = "Monto"
  valueKPI1: number = 0;
  valueKPI2: number = 0;
  valueKPI3: number = 0;

  constructor() {
    Chart.register(...registerables); // Registra todos los elementos de chart.js
  }

  ngOnInit(): void {
    this.loadReportPeriod([18, 17, 3]);
    this.loadPeriodsList();
    this.form.valueChanges.subscribe(values => {
      console.log(values)
      if(values.anio!=null && values.mes != null){
        const period = this.periodsList.find((p)=>p.month===Number(values.mes) && p.year===Number(values.anio))
        if(period){
          if(this.listPeriodFind.some((p)=>p.id===period.id)){
            this.toastService.sendError("Ya selecciono este periodo")
          } else{
            if(this.listPeriodFind.length>5){
              this.toastService.sendError("Alcanzo el limite de periodos")
              return
            }
            const monthName = this.meses.find(m=>m.numero ===period.month)
            if(monthName){
              period.monthName = monthName?.nombre?.slice(0, 3) || "";
            }
            this.listPeriodFind.push(period)
          }
        }
        this.form.reset()
        this.loadReportPeriod(this.listPeriodFind.map(p=>p.id))
      }
    });
  }
  loadPeriodsList() {
    this.periodService.get().subscribe((data) => {
      this.periodsList = data;
      this.periodsList.forEach((p, index) => {
        if (index < 3) {
          const monthName = this.meses.find(m=>m.numero ===p.month)
          if(monthName){
            p.monthName = monthName?.nombre?.slice(0, 3) || "";

          }
          this.listPeriodFind.push(p)
          this.loadReportPeriod(
            this.listPeriodFind.map((p) => Number(p.id))
          );
        }
      });
      this.createFilter();
    });
  }
  loadReportPeriod(ids: number[]) {
    if (!ids || ids.length === 0) {
      console.error('Error: no ids provided');
      return; // Maneja el caso cuando no se proporcionan ids
    }
    this.reportPeriodService.getReportPeriods(ids).subscribe({
      next: (data) => {
        this.reportPeriod = data;
        this.getTopOneSupplier();
        this.calculateKPI(data.resume, this.typeFilter);
        this.loadResume();

      },
      error: (error) => {
        console.error('Error loading report periods:', error);
      },
    });
  }
  createFilter() {
    this.filterConfig = [
      new RadioFilter('Monto total', 'typeFilter', [
        { value: 'Monto', label: 'Monto total' },
        { value: 'Porcentaje', label: 'Porcentaje' },
        { value: 'Promedio', label: 'Promedio' },
      ])
    ];
  }
  filterChange($event: Record<string, any>) {
    const { typeFilter, PeriodId } = $event;
    if (typeFilter) {
      this.typeFilter = typeFilter;
    }

    const selectedPeriod = this.periodsList.find((p) => p.id === PeriodId);
    if (selectedPeriod) {
      if (this.listPeriodFind.some((p) => p.id === selectedPeriod.id)) {
        this.toastService.sendError('El período ha sido seleccionado');
        return;
      }
      // Check if the number of selected periods exceeds 5
      if (this.listPeriodFind.length >= 5) {
        this.toastService.sendError(
          'Se pueden seleccionar como máximo 5 períodos'
        );
        return;
      }

      this.listPeriodFind.unshift(selectedPeriod); // Agrega el período al inicio de la lista
      this.createFilter(); // Actualiza el filtro de períodos
      this.loadReportPeriod(this.listPeriodFind.map((p) => Number(p.id)));
    }
  }

  deletePeriod(index: number) {
    const periodToDelete = this.listPeriodFind[index];
    this.listPeriodFind.splice(index, 1);
    this.createFilter(); // Actualiza el filtro de períodos
    if (this.listPeriodFind.length === 0) {
      (this.valueKPI1 = 0), (this.valueKPI3 = 0), (this.valueKPI2 = 0);
      this.reportPeriod = {
        resume: {
          period: {
            month: 0,
            year: 0,
            state: '',
            id: 0,
            start_date: new Date(),
            end_date: new Date(),
          },
          ordinary: [],
          extraordinary: [],
          supplier_ordinary: [],
          supplier_extraordinary: [],
        },
        periods: [],
      };

      return;
    }
    this.loadReportPeriod(this.listPeriodFind.map((p) => Number(p.id)));
  }


  calculateKPI(resume: Resume, type: string): void {
    let totalAmount = 0;
    let totalOrdinary = 0;
    resume.ordinary.map((item) => {
      totalOrdinary += item.data.totalAmount;
      totalAmount += item.data.totalAmount;
    });
    let totalExtraordinary = 0;
    resume.extraordinary.map((item) => {
      totalExtraordinary += item.data.totalAmount;
      totalAmount += item.data.totalAmount;
    });

    let totalBillsO = resume.ordinary.length;
    let totalBillsE = resume.extraordinary.length;

    if (isNaN(totalAmount)) totalAmount = 0;
    if (isNaN(totalOrdinary)) totalOrdinary = 0;
    if (isNaN(totalExtraordinary)) totalExtraordinary = 0;

    switch (type) {
      case 'Monto': {
        this.valueKPI1 = Number((totalOrdinary / 1000000).toFixed(3));
        this.valueKPI2 = Number((totalExtraordinary / 1000000).toFixed(3));
        this.valueKPI3 = Number((totalAmount / 1000000).toFixed(3));
        break;
      }
      case 'Porcentaje': {
        this.valueKPI1 = (totalOrdinary / totalAmount) * 100;
        this.valueKPI2 = (totalExtraordinary / totalAmount) * 100;
        this.valueKPI3 = 0;
        break;
      }
      case 'Promedio': {
        this.valueKPI1 = Number(
          (totalOrdinary / totalBillsO / 1000000).toFixed(3)
        );
        this.valueKPI2 = Number(
          (totalExtraordinary / totalExtraordinary / 1000000).toFixed(3)
        );
        this.valueKPI3 = Number(
          (totalAmount / (totalBillsO + totalBillsE) / 1000000).toFixed(3)
        );
        break;
      }
      default:
        return;
    }
  }
  loadResume() {

    this.createSuppliersChart(
      'supplier-ordinary',
      this.reportPeriod?.resume?.supplier_ordinary || [],
      'Top 5 proveedores ordinarios'
    );
    this.createSuppliersChart(
      'supplier-extraordinary',
      this.reportPeriod?.resume?.supplier_extraordinary || [],
      'Top 5 de proveedores extraordinarios'
    );
  }

  /**
   *
   */
  topSupplier: any;

  getTopOneSupplier() {
    const suppliers = this.reportPeriod?.resume.supplier_ordinary;

    if (suppliers && suppliers.length > 0) {
      this.topSupplier = suppliers.reduce((top, current) => {
        return current.totalAmount > top.totalAmount ? current : top;
      });
    } else {
      this.topSupplier = null;
    }
  }

  private router = inject(Router);

  navigateToTopSuppliers() {
    this.router.navigate(['expenses//gastos/top-proveedores']);
  }

  //De aca para abajo son los metodos que crean los graficos
  //grafico ordinarias/extraordinarias
  createChartResume(
    chartId: string,
    ordinary: CategoryData[],
    extraordinary: CategoryData[],
    element: string
  ): any {
    let reportMap = new Map<string, Report>();

    ordinary.map((ord) => {
      let category = ord.category;
      let amount = 0;

      if (this.typeFilter == 'Porcentaje') {
        amount = ord.data.percentage;
      } else if (this.typeFilter == 'Promedio') {
        amount = ord.data.average;
      } else {
        amount = ord.data.totalAmount;
      }
      if (reportMap.has(category)) {
        let existingReport = reportMap.get(category);
        if (existingReport) {
          existingReport.ordinary = amount;
        }
      } else {
        reportMap.set(category, {
          label: category,
          ordinary: amount,
          extraordinary: 0,
        });
      }
    });

    extraordinary.map((extr) => {
      let category = extr.category;
      let amount = 0;

      if (this.typeFilter == 'Porcentaje') {
        amount = extr.data.percentage;
      } else if (this.typeFilter == 'Promedio') {
        amount = extr.data.average;
      } else {
        amount = extr.data.totalAmount;
      }

      if (reportMap.has(category)) {
        let existingReport = reportMap.get(category);
        if (existingReport) {
          existingReport.extraordinary = amount;
        }
      } else {
        reportMap.set(category, {
          label: category,
          ordinary: 0,
          extraordinary: amount,
        });
      }
    });
    let labels: string[] = [];
    let ordinaryValues: number[] = [];
    let extraordinaryValues: number[] = [];
    reportMap.forEach((value, key) => {
      labels = [...labels, key];
      ordinaryValues = [...ordinaryValues, value.ordinary / 1000000];
      extraordinaryValues = [
        ...extraordinaryValues,
        value.extraordinary / 1000000,
      ];
    });
    const chartData: ChartData<'radar'> = {
      labels: labels,
      datasets: [
        {
          label: 'Ordinarias ', // Etiqueta para las datos ordinarios
          data: ordinaryValues,
          datalabels: {
            labels: {
              title: null
            }
          },
          borderColor: 'rgba(13,110,253,1)',
          backgroundColor: 'rgba(13, 110, 253, 0.2)', // Color de fondo para las áreas ordinarias
          borderWidth: 1,
          pointBackgroundColor: 'rgba(13, 110, 253, 0.2)', // Color de los puntos en las líneas
        },
        {
          label: 'Extraordinarias ',
          datalabels: {
            labels: {
              title: null
            }
          },
          data: extraordinaryValues,
          borderColor: 'rgba(220, 53, 69, 1)',
          backgroundColor: 'rgba(220, 53, 69, 0.2)', // Color de fondo para las áreas extraordinarias
          borderWidth: 1,
        },
      ],
    };
    const chartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Comparación de Ordinarias y Extraordinarias',
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
          },
        },
        legend: {
          onClick: (event, legendItem) => {
            if (legendItem.text === 'Ordinarias ') {
              console.log("Ordinarias")
            } else if (legendItem.text === 'Extraordinarias') {
              console.log('Extraordinarias ');
            }
          },
        },
      },
    };

    try {
      let canvas;
      const parentElement = document.getElementById(element); // Obtén el elemento padre

      if (parentElement) {
        // Elimina todos los hijos del contenedor
        while (parentElement.firstChild) {
          parentElement.removeChild(parentElement.firstChild);
        }

        // Crea el canvas y añádelo
        canvas = document.createElement('canvas');
        canvas.id = chartId; // Asigna un ID único para cada gráfico
        canvas.height=75
        parentElement.appendChild(canvas); // Añade el canvas al contenedor
      }

      // Crear el gráfico con el nuevo canvas
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar', // Gráfico de tipo torta
          data: chartData,
          options: chartOptions,
        });

        // Guardar la instancia del gráfico para posibles manipulaciones posteriores
        this.chartInstances.push(chart);
        return chart; // Devolver la instancia del gráfico
      }
    } catch (err) {
    }
  }

  //grafico proveedores
  createSuppliersChart(
    chartId: string,
    suppliers: SupplierAmount[],
    title: string
  ): any {
    suppliers = suppliers
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
    const labels = suppliers.map((item) => item.supplierDTO.name);
    const data = suppliers.map((item) =>
      Number((item.totalAmount / 1000000).toFixed(3))
    );
    const chartData: ChartData<'bar'> = {
      labels: labels,
      datasets: [
        {
          label: 'Monto total proveedores en millones',
          data: data,
          datalabels: {
            display: true,
            formatter: (value) => {
              return `$${(value * 1000000).toLocaleString()}`; // Multiplica por 10,000 y agrega el símbolo $
            },
            labels: {
              title: {
                font: {
                  weight: 'bold',
                },
              },
            },
          },
          backgroundColor:
            chartId == 'supplier-ordinary'
              ? 'rgba(98, 182, 143, 1)'
              : 'rgba(255, 145, 158, 1)', // Color de fondo de las barras
          borderColor:
            chartId == 'supplier-ordinary'
              ? 'rgba(98, 182, 143, 1)'
              : 'rgba(255, 145, 158, 1)',
          borderWidth: 1,
        },
      ],
    };

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: title,
        },
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) =>
              `${tooltipItem.dataset.label}: $${tooltipItem.formattedValue}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true, // Asegura que el eje X comience en 0
        },
      },
    };

    try {
      let canvas;
      const parentElement = document.getElementById(chartId);

      if (parentElement) {
        // Elimina todos los hijos del contenedor
        while (parentElement.firstChild) {
          parentElement.removeChild(parentElement.firstChild);
        }

        // Crea el canvas y añádelo
        canvas = document.createElement('canvas');
        canvas.id = chartId; // Asigna un ID único para cada gráfico
        parentElement.appendChild(canvas); // Añade el canvas al contenedor
      }

      // Crear el gráfico con el nuevo canvas
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        const ordinaryChart = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: chartOptions,
        });

        // Guardar la instancia del gráfico para posibles manipulaciones posteriores
        this.chartInstances.push(ordinaryChart);
        return ordinaryChart; // Devolver la instancia del gráfico
      }
    } catch (err) {
    }
  }

  exportToExcel() {
    const combinedData = this.reportPeriod?.periods.flatMap((period) => {
      const ordinaryData = period.ordinary.map((item) => ({
        Period: `${period.period.month}/${period.period.year}`,
        Category: item.category,
        Type: 'Ordinaria',
        Amount: item.data.totalAmount,
        Percentage: item.data.percentage / 100,
        Average: item.data.average,
      }));

      const extraordinaryData = period.extraordinary.map((item) => ({
        Period: `${period.period.month}/${period.period.year}`,
        Category: item.category,
        Type: 'Extraordinaria',
        Amount: item.data.totalAmount,
        Percentage: item.data.percentage / 100,
        Average: item.data.average,
      }));

      return [...ordinaryData, ...extraordinaryData];
    });

    const data = combinedData?.map((period) => ({
      Periodo: period.Period,
      Categoría: period.Category,
      'Tipo de gasto': period.Type,
      'Monto Total': period.Amount,
      Porcentaje: period.Percentage,
      Promedio: period.Average,
    }));

    if (!data) {
      console.error('No data available for export');
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const col = XLSX.utils.encode_col(C);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cell = ws[`${col}${R + 1}`];
        if (cell) {
          if (col === 'D' || col === 'F') {
            // Columnas de Amount y Average
            cell.z = '$0.00';
          } else if (col === 'E') {
            // Columna de Percentage
            cell.z = '0.00%';
          }
        }
      }
    }

    // Ajustar el tamaño de las columnas
    ws['!cols'] = [
      { wch: 15 }, // Periodo
      { wch: 30 }, // Categoría
      { wch: 15 }, // Tipo de gasto
      { wch: 15 }, // Monto Total
      { wch: 10 }, // Porcentaje
      { wch: 15 }, // Promedio
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `Expenses_report:${new Date().getTime()}.xlsx`);
  }
}
interface Report {
  label: string;
  ordinary: number;
  extraordinary: number;
}
