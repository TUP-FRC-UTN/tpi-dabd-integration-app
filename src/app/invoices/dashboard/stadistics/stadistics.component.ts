import { ChangeDetectorRef, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MainContainerComponent} from "ngx-dabd-grupo01";
import {NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import {GoogleChartsModule} from "angular-google-charts";
import {KpiComponent} from "../commons/kpi/kpi.component";

import {NgClass} from "@angular/common";
import { DashboardStatus, PeriodRequest } from '../../models/stadistics';
import { MainDashboardComponent } from '../main-dashboard/main-dashboard.component';
import { BarchartComponent } from '../commons/barchart/barchart.component';
import { StadisticsService } from '../../services/stadistics.service';
import { InfoComponent } from '../../info/info.component';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MainContainerComponent, // Verifica si es standalone o usa su módulo
    GoogleChartsModule,      // Verifica si es compatible
    NgbPopoverModule
  ],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent implements OnInit {

  //filters
  filters:PeriodRequest = {} as PeriodRequest

  //dashboard settings
  status: DashboardStatus = DashboardStatus.All;


  //services
  modalService = inject(NgbModal);


  //Childs
  // @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  // @ViewChild(EntriesDashboardComponent) entries!: EntriesDashboardComponent;
  // @ViewChild(LateDashboardComponent) late!: LateDashboardComponent;
  // @ViewChild(TypesDashboardComponent) types!: TypesDashboardComponent;
  // @ViewChild(InconsistenciesDashboardComponent) inconsistencies!: InconsistenciesDashboardComponent;


  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;

  @ViewChild('infoModal') infoModal!: TemplateRef<any>

  constructor(
    private stadisticsService: StadisticsService,
    private cdr: ChangeDetectorRef) {
  }

  initializeDefaultDates(){
    this.filters.group = ""
    this.filters.type = ""
    this.filters.action = "ENTRY"
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.lastDate = now.toISOString().slice(0, 16);

    now.setDate(now.getDate() - 14);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.firstDate = now.toISOString().slice(0, 16);
  }

  onInfoButtonClick() {
   this.modalService.open(this.infoModal, { size: 'lg' });
  }

  resetFilters(){
    this.initializeDefaultDates();
    this.filters.type = "";
    this.filters.group = "DAY"
    this.filters.action = "ENTRY"
    this.filterData()
  }

  filterData(){
    // this.main.getData()
    // this.entries.getData()
    // this.types.getData()
    // this.inconsistencies.getData()
    // this.late.getData()
  }

  ngOnInit(): void {
  }

  changeMode(event: any){
    const statusKey = Object.keys(DashboardStatus).find(key => DashboardStatus[key as keyof typeof DashboardStatus] === event);

    if (statusKey) {
      this.status = DashboardStatus[statusKey as keyof typeof DashboardStatus];
    } else {
      console.error('Valor no válido para el enum');
    }
  }

  protected readonly DashboardStatus = DashboardStatus;

  ngAfterViewInit(): void {
    this.initializeDefaultDates();
    this.filterData();
    this.cdr.detectChanges(); // Fuerza la detección de cambios
  }

    // ACA SE ABRE EL MODAL DE INFO
    showInfo(): void {
      const modalRef = this.modalService.open(InfoComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        scrollable: true,
      });
      modalRef.componentInstance.data = { role: 'owner' };
    }
}
