import {Component, Input} from '@angular/core';
import {KpiModel} from "../../../../models/dashboard.model";

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.css'
})
export class KpiComponent {
  @Input() kpi:KpiModel = {} as KpiModel
}
