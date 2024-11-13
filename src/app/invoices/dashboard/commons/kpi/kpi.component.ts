import { Component, Input } from '@angular/core';
import { kpiModel } from '../../../models/stadistics';

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss'
})
export class KpiComponent {
  @Input() kpi:kpiModel = {} as kpiModel
}
