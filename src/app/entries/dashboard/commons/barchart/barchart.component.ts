import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ChartType, GoogleChartsModule} from "angular-google-charts";
import { graphModel } from '../../../models/dashboard/dashboard.model';


@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [
    GoogleChartsModule
  ],
  templateUrl: './barchart.component.html',
  styleUrl: './barchart.component.css'
})
export class BarchartComponent {
  @Input() graphModel: graphModel = {} as graphModel

  columnChartOptions = {
    backgroundColor: 'transparent',
    colors: [
      '#e0f59d',  // Amarillo claro (simulando transparencia)
      '#95a0d9',  // Azul claro
      '#ff919e',  // Rosa claro
      '#a2d9a5',  // Verde menta claro
      '#ffccd7'  // Morado claro
    ],
    legend: {position: 'none'},
    chartArea: {width: '80%', height: '100%'},
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
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: '100%',
    bar: {
      groupWidth: '70%',
      stroke: this.graphModel.options?.colors?.[0] === '#a2d9a5' ? '##e0f59d' : '#ff919e',  // Color del borde según sea ingreso o egreso
      strokeWidth: 2      // Ancho del borde
    }
  };
  columnChartType = ChartType.ColumnChart;
}