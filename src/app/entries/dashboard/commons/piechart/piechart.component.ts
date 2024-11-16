import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ChartType, GoogleChartsModule} from "angular-google-charts";
import { graphModel } from '../../../models/dashboard/dashboard.model';

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
  @Input() graphModel: graphModel = {} as graphModel

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
      0: { color: '#e0f59d' },
      1: { color: '#95a0d9' },  
      2: { color: '#ff919e' } ,  
      3: { color: '#a2d9a5' },   
      4: { color: '#ffccd7' }   
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 18
    }
  };

}
