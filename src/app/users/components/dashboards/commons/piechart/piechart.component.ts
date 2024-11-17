import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ChartType, GoogleChartsModule} from "angular-google-charts";
import {GraphModel} from "../../../../models/dashboard.model";

@Component({
  selector: 'app-piechart',
  standalone: true,
  imports: [
    GoogleChartsModule
  ],
  templateUrl: './piechart.component.html',
  styleUrl: './piechart.component.css'
})
export class PiechartComponent {
  @Input() graphModel: GraphModel = {} as GraphModel

  pieChartType = ChartType.PieChart;
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

}
