import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {  Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeriodSelectComponent } from '../../selects/period-select/period-select.component';
import { CommonModule, DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import {
  ChartData,
  ChartOptions,
} from 'chart.js';

import { NgPipesModule } from 'ngx-pipes';
import { Chart, registerables } from 'chart.js';
import {
  TableComponent,
  MainContainerComponent,
  ToastService,
  TableFiltersComponent,
  Filter,
  FilterOption,
  SelectFilter,
  RadioFilter,
} from 'ngx-dabd-grupo01';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Expense from '../../../models/expense';
import { BaseChartDirective } from 'ng2-charts';
import { ReportPeriodService } from '../../../services/report-period/report-period.service';
import { ReportPeriod } from '../../../models/report-period/report-period';
import Period from '../../../models/period';
import { PeriodService } from '../../../services/period.service';
import { CategoryData } from '../../../models/report-period/category-data';
import { Resume } from '../../../models/report-period/resume';
import { SupplierAmount } from '../../../models/report-period/SupplierAmount';
import * as XLSX from "xlsx";
@Component({
  selector: 'app-expenses-report',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PeriodSelectComponent,
    TableComponent,
    NgPipesModule,
    MainContainerComponent,
    TableFiltersComponent,
    BaseChartDirective,
  ],
  providers: [DatePipe, NgbActiveModal,CurrencyPipe,DecimalPipe],
  templateUrl: './expenses-period-report.component.html',
  styleUrl: './expenses-period-report.component.css',
})
export class ExpensesPeriodReportComponent implements OnInit {
  private reportPeriodService = inject(ReportPeriodService);
  private periodService = inject(PeriodService);
  private toastService = inject(ToastService);

  reportPeriod: ReportPeriod | undefined;

  periodos: Period[] = [];
  filters: Filter[] = [];

  ordinaryData: { category: string; percentage: number }[] = [];
  extraordinaryData: { category: string; percentage: number }[] = [];

  periodsFilter: FilterOption[] = [];
  lotss: FilterOption[] = [];
  types: FilterOption[] = [];

  //lista principal del select
  periodsList: FilterOption[] = [];
  filterConfig: Filter[] = [];

  //copia para las cards
  listPeriodFind:FilterOption[]=[]
  expenses: Expense[] = [];
  searchTerm: string = '';
  chartInstances: any[] = [];
  resumeReportOrdinary: any;
  resumeReportExtraordinary: any;
  typeFilter: string = 'Monto';
  valueKPI1: number = 0;
  valueKPI2: number = 0;
  valueKPI3: number = 0;

  constructor() {
    Chart.register(...registerables); // Registra todos los elementos de chart.js
  }


  ngOnInit(): void {
    this.loadReportPeriod([18, 17, 3]);
    this.loadPeriodsList();
  }
  loadPeriodsList() {
    this.periodService.get().subscribe((data) => {
      this.periodsList =data.map((per,index)=>{
        return {value:per.id.toString(),label:`${per.month}/${per.year}`}})
        this.periodsList.forEach((p,index)=>{
          if(index<3){
            this.listPeriodFind.unshift(p); // Agrega el período al inicio de la lista
            this.loadReportPeriod(this.listPeriodFind.map((p) => Number(p.value)));
          }
        })
      this.createFilter()

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

        console.log(data)
      },
      error: (error) => {
        console.error('Error loading report periods:', error);
      },
    });

  }
  createFilter(){
   this.filterConfig= [
      new RadioFilter('Monto total', 'typeFilter', [
        { value: 'Monto', label: 'Monto total' },
        { value: 'Porcentaje', label: 'Porcentaje' },
        { value: 'Promedio', label: 'Promedio' },
      ]),
      new SelectFilter(
        'Periodos',
        'PeriodId',
        'Agregue un periodo',
        this.getPeriodOptions()
      ),
    ];
  }
  filterChange($event: Record<string, any>) {
    const { typeFilter, PeriodId } = $event;
    if (typeFilter) {
      this.typeFilter = typeFilter;
    }

    const selectedPeriod = this.periodsList.find((p) => p.value === PeriodId);
    if (selectedPeriod) {

      if (this.listPeriodFind.some((p) => p.value === selectedPeriod.value)) {
        this.toastService.sendError('El período ha sido seleccionado');
        return;
      }
      // Check if the number of selected periods exceeds 5
      if (this.listPeriodFind.length >= 5) {
        this.toastService.sendError('Se pueden seleccionar como máximo 5 períodos');
        return;
      }

      this.listPeriodFind.unshift(selectedPeriod); // Agrega el período al inicio de la lista
      this.createFilter(); // Actualiza el filtro de períodos
      this.loadReportPeriod(this.listPeriodFind.map((p) => Number(p.value)));
    }
  }

  deletePeriod(index: number) {
    const periodToDelete = this.listPeriodFind[index];
    this.listPeriodFind.splice(index, 1);
    this.createFilter(); // Actualiza el filtro de períodos
    if(this.listPeriodFind.length===0){
      const parentElement = document.getElementById("supplier-ordinary"); // Obtén el elemento padre
      this.valueKPI1=0,
      this.valueKPI3=0,
      this.valueKPI2=0
      if (parentElement) {
        // Elimina todos los hijos del contenedor
        while (parentElement.firstChild) {
          parentElement.removeChild(parentElement.firstChild);
        }
      }
      const parentElement2 = document.getElementById("supplier-extraordinary"); // Obtén el elemento padre

      if (parentElement2) {
        // Elimina todos los hijos del contenedor
        while (parentElement2.firstChild) {
          parentElement2.removeChild(parentElement2.firstChild);
        }
      }
      const parentElement3 = document.getElementById("chart-container-periods-extraordinary"); // Obtén el elemento padre

      if (parentElement3) {
        // Elimina todos los hijos del contenedor
        while (parentElement3.firstChild) {
          parentElement3.removeChild(parentElement3.firstChild);
        }
      }
      const parentElement4 = document.getElementById("chart-container-periods-ordinary"); // Obtén el elemento padre

      if (parentElement4) {
        // Elimina todos los hijos del contenedor
        while (parentElement4.firstChild) {
          parentElement4.removeChild(parentElement4.firstChild);
        }
      }
      const parentElement5 = document.getElementById("chart-container-ordinary"); // Obtén el elemento padre

      if (parentElement5) {
        // Elimina todos los hijos del contenedor
        while (parentElement5.firstChild) {
          parentElement5.removeChild(parentElement5.firstChild);
        }
      }

      return
    }
    this.loadReportPeriod(this.listPeriodFind.map((p) => Number(p.value)));

  }
  getPeriodOptions(): { value: string; label: string }[] {
    return this.periodsList.filter(
      (period) => !this.listPeriodFind.some((p) => p.value === period.value)
    );
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
      case 'Monto':{
        this.valueKPI1 = Number((totalOrdinary/1000000).toFixed(3));
        this.valueKPI2 = Number((totalExtraordinary/1000000).toFixed(3));
        this.valueKPI3 = Number((totalAmount/1000000).toFixed(3));
        break;
      }
      case 'Porcentaje': {
        this.valueKPI1 = (totalOrdinary / totalAmount)*100;
        this.valueKPI2 = (totalExtraordinary / totalAmount)*100;
        this.valueKPI3= 0 ;
        break;
      }
      case 'Promedio':{
        this.valueKPI1 = Number(((totalOrdinary / totalBillsO)/1000000).toFixed(3));
        this.valueKPI2 = Number(((totalExtraordinary / totalExtraordinary)/1000000).toFixed(3));
        this.valueKPI3 = Number(((totalAmount / (totalBillsO+totalBillsE))/1000000).toFixed(3));
        break;
      }
      default:
        return;
    }
  }
  loadResume() {
    // Crea los gráficos para las expensas ordinarias y extraordinarias
    if (this.reportPeriod) {
      this.createChartResume(
        'resume-ordinary',
        this.reportPeriod.resume.ordinary || [],
        this.reportPeriod.resume.extraordinary || [],
        'chart-container-ordinary'
      );
    }
    this.createChartPeriods(
      `chart-container-periods`,
      this.reportPeriod?.periods || [],
      'chart-container-periods'
    );
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
    this.router.navigate(['/gastos/top-proveedores']);
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
      } else  {
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
      ordinaryValues = [...ordinaryValues, value.ordinary/1000000];
      extraordinaryValues = [...extraordinaryValues, value.extraordinary/1000000];
    });
    const chartData: ChartData<'radar'> = {
      labels: labels,
      datasets: [
        {
          label: 'Ordinarias ', // Etiqueta para las datos ordinarios
          data: ordinaryValues,
          borderColor: 'rgba(13,110,253,1)',
          backgroundColor: 'rgba(13, 110, 253, 0.2)', // Color de fondo para las áreas ordinarias
          borderWidth: 1,
          pointBackgroundColor: 'rgba(13, 110, 253, 0.2)', // Color de los puntos en las líneas
        },
        {
          label: 'Extraordinarias ', // Etiqueta para los datos extraordinarios
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
            label: (tooltipItem) => {
              return `${tooltipItem.label}: ${tooltipItem.raw}`;
            },
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
      console.log('Error creating chart:', err);
    }
  }

  //filtro de por categoria (el de abajo)
  createChartPeriods(chartId: string, periods: Resume[], element: string): any {
    // Obtener las categorías comunes de todos los períodos (suponiendo que las categorías no cambian entre períodos)
    const labels = periods[0].ordinary.map((item) => item.category);

    // Función para obtener el color de fondo y borde según el índice
    const getColor = (index: number) => {
      const colorsBorder = [
        'rgba(255, 193, 7, 1)', // Amarillo
        'rgba(25, 135, 84, 1)', // Verde
        'rgba(123, 31, 162, 1)', // Púrpura
        'rgba(255, 87, 34, 1)', // Naranja
        'rgba(76, 175, 80, 1)', // Verde claro
        'rgba(63, 81, 181, 1)', // Azul índigo
        'rgba(244, 67, 54, 1)', // Rojo claro
        'rgba(0, 150, 136, 1)', // Turquesa
        'rgba(255, 235, 59, 1)', // Amarillo claro
        'rgba(205, 220, 57, 1)', // Lima
        'rgba(158, 158, 158, 1)', // Gris
        'rgba(121, 85, 72, 1)', // Café
        'rgba(33, 150, 243, 1)', // Azul
      ];
      const colors = [
        'rgba(255, 193, 7, 0.2)', // Amarillo
        'rgba(25, 135, 84, 0.2)', // Verde
        'rgba(123, 31, 162, 0.2)', // Púrpura
        'rgba(255, 87, 34, 0.2)', // Naranja
        'rgba(76, 175, 80, 0.2)', // Verde claro
        'rgba(63, 81, 181, 0.2)', // Azul índigo
        'rgba(244, 67, 54, 0.2)', // Rojo claro
        'rgba(0, 150, 136, 0.2)', // Turquesa
        'rgba(255, 235, 59, 0.2)', // Amarillo claro
        'rgba(205, 220, 57, 0.2)', // Lima
        'rgba(158, 158, 158, 0.2)', // Gris
        'rgba(121, 85, 72, 0.2)', // Café
        'rgba(33, 150, 243, 0.2)', // Azul
      ];
      return {
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 1,
      };
    };

    // Crear los datos para las barras "Ordinarias"
    const ordinaryDatasets = periods.map((periodData, index) => {
      let data: number[] = [];

      // Dependiendo del filtro, se obtienen los valores correspondientes

      if (this.typeFilter == 'Porcentaje') {
        data = periodData.ordinary.map((item) => item.data.percentage);
      } else if (this.typeFilter == 'Promedio') {
        data = periodData.ordinary.map((item) => item.data.average/1000000);
      }   else  {
        data = periodData.ordinary.map((item) => item.data.totalAmount/1000000);
      }

      // Asignar los colores y crear el dataset para las "Ordinarias"
      return {
        Title: 'Ordinarias',
        label: `${periodData.period.month}/${periodData.period.year} `,
        data: data,
        ...getColor(index), // Asignar color de fondo y borde según el índice
      };
    });

    // Crear los datos para las barras "Extraordinarias"
    const extraordinaryDatasets = periods.map((periodData, index) => {
      let data: number[] = [];
       if (this.typeFilter == 'Porcentaje') {
        data = periodData.ordinary.map((item) => item.data.percentage);
      } else if (this.typeFilter == 'Promedio') {
        data = periodData.ordinary.map((item) => item.data.average/1000000);
      } else {
        data = periodData.ordinary.map((item) => item.data.totalAmount/1000000);
      }
      return {
        Title: 'Extraordinarias',
        label: `${periodData.period.month}/${periodData.period.year} `,
        data: data,
        ...getColor(index),
      };
    });

    // Datos del gráfico "Ordinarias"
    const ordinaryChartData: ChartData<'bar'> = {
      labels: labels,
      datasets: ordinaryDatasets,
    };

    // Datos del gráfico "Extraordinarias"
    const extraordinaryChartData: ChartData<'bar'> = {
      labels: labels,
      datasets: extraordinaryDatasets,
    };

    const ordinaryChartOptions: ChartOptions = {
      responsive: true,
      indexAxis: 'y', // Cambia la orientación a horizontal
      plugins: {
        title: {
          display: true,
          text: 'Ordinarias',
        },
        legend: {
          position: 'top',
        },

        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
            },
          },
        },
      },
    };

    const extraordinaryChartOptions: ChartOptions = {
      responsive: true,
      indexAxis: 'y', // Cambia la orientación a horizontal
      plugins: {
        title: {
          display: true,
          text: 'Extraordinarias',
        },
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
            },
          },
        },
      },
    };

    try {
      // Crear un nuevo canvas para cada gráfico
      const parentElementOrdinary = document.getElementById(
        'chart-container-periods-ordinary'
      );
      const parentElementExtraordinary = document.getElementById(
        'chart-container-periods-extraordinary'
      );

      // Verificar que el contenedor existe
      if (parentElementOrdinary) {
        // Eliminar todos los hijos del contenedor
        while (parentElementOrdinary.firstChild) {
          parentElementOrdinary.removeChild(parentElementOrdinary.firstChild);
        }

        // Crear un nuevo canvas para cada gráfico
        const ordinaryCanvas = document.createElement('canvas');
        parentElementOrdinary.appendChild(ordinaryCanvas);

        // Crear el gráfico de barras "Ordinarias"
        const ordinaryCtx = ordinaryCanvas.getContext('2d');
        if (ordinaryCtx) {
          const ordinaryChart = new Chart(ordinaryCtx, {
            type: 'bar',
            data: ordinaryChartData,
            options: ordinaryChartOptions,
          });
          this.chartInstances.push(ordinaryChart);
        }
      }
      if (parentElementExtraordinary) {
        while (parentElementExtraordinary.firstChild) {
          parentElementExtraordinary.removeChild(
            parentElementExtraordinary.firstChild
          );
        }

        const extraordinaryCanvas = document.createElement('canvas');
        parentElementExtraordinary.appendChild(extraordinaryCanvas);

        // Crear el gráfico de barras "Extraordinarias"
        const extraordinaryCtx = extraordinaryCanvas.getContext('2d');
        if (extraordinaryCtx) {
          const extraordinaryChart = new Chart(extraordinaryCtx, {
            type: 'bar',
            data: extraordinaryChartData,
            options: extraordinaryChartOptions,
          });
          this.chartInstances.push(extraordinaryChart);
        }
      }
      return null;
    } catch (err) {
      console.log('Error creating chart:', err);
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
    const data = suppliers.map((item) =>Number((item.totalAmount/1000000).toFixed(3)) );
    const chartData: ChartData<'bar'> = {
      labels: labels,
      datasets: [
        {
          label: 'Monto total proveedores en millones',
          data: data,
          backgroundColor:
            chartId == 'supplier-ordinary'
              ? 'rgba(54, 162, 235, 0.2)'
              : 'rgba(220, 53, 69, 0.2)', // Color de fondo de las barras
          borderColor:
            chartId == 'supplier-ordinary'
              ? 'rgba(13,110,253,1)'
              : 'rgba(220, 53, 69, 1)',
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
      console.log('Error creating chart:', err);
    }
  }


  exportToExcel() {
    const combinedData =  (this.reportPeriod?.periods.flatMap(period => {
      const ordinaryData = period.ordinary.map(item => ({
        Period: `${period.period.month}/${period.period.year}`,
        Category: item.category,
        Type: 'Ordinaria',
        Amount: item.data.totalAmount,
        Percentage: item.data.percentage/100,
        Average: item.data.average
      }));

      const extraordinaryData = period.extraordinary.map(item => ({
        Period: `${period.period.month}/${period.period.year}`,
        Category: item.category,
        Type: 'Extraordinaria',
        Amount: item.data.totalAmount,
        Percentage: item.data.percentage/100,
        Average: item.data.average
      }));

      return [...ordinaryData, ...extraordinaryData];
    }));

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
          if (col === 'D' || col === 'F') { // Columnas de Amount y Average
            cell.z = '$0.00';
          } else if (col === 'E') { // Columna de Percentage
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
