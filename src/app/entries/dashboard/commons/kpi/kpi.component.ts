import {Component, Input} from '@angular/core';
import { kpiModel } from '../../../models/dashboard/dashboard.model';


@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.css'
})
export class KpiComponent {
  @Input() kpi:kpiModel = {} as kpiModel
}
