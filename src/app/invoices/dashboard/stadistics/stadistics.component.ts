import { ChangeDetectorRef, Component, Inject, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MainContainerComponent} from "ngx-dabd-grupo01";
import {NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import {GoogleChartsModule} from "angular-google-charts";
import {KpiComponent} from "../commons/kpi/kpi.component";

import {CommonModule, NgClass} from "@angular/common";
import { DashboardStatus, PeriodRequest } from '../../models/stadistics';
import { MainDashboardComponent } from '../main-dashboard/main-dashboard.component';
import { BarchartComponent } from '../commons/barchart/barchart.component';
import { StadisticsService } from '../../services/stadistics.service';
import { InfoComponent } from '../../info/info.component';
import { DistributionPaymentMethodsComponent } from "../distribution-payment-methods/distribution-payment-methods.component";
import { TotalPaymentsComponent } from '../total-payments/total-payments.component';
// import { DashBoardFilters } from '../../models/dashboard.model';

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MainContainerComponent, // Verifica si es standalone o usa su módulo
    GoogleChartsModule, // Verifica si es compatible
    NgbPopoverModule,
    MainDashboardComponent,
    DistributionPaymentMethodsComponent,
    DistributionPaymentMethodsComponent,
    TotalPaymentsComponent,
    CommonModule,
],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent implements OnInit {

  //filters
  filters:PeriodRequest = {} as PeriodRequest
  // filters: DashBoardFilters = {} as DashBoardFilters;

  //dashboard settings
  status: DashboardStatus = DashboardStatus.All;


  //services
  modalService = inject(NgbModal);


  //Childs
  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(DistributionPaymentMethodsComponent) distribution!: DistributionPaymentMethodsComponent;
  @ViewChild(TotalPaymentsComponent) total!: TotalPaymentsComponent;


  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;

  @ViewChild('infoModal') infoModal!: TemplateRef<any>

  constructor(
      private stadisticsService: StadisticsService,
      @Inject(ChangeDetectorRef) private cdr: ChangeDetectorRef) {
    }

  initializeDefaultDates(){
    const now = new Date();

    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // `padStart` asegura que el mes tenga dos dígitos
    const year = now.getFullYear().toString();

    // Asigna las fechas en formato MM-YYYY
    this.filters.firstDate = `${'01'}/${year.slice(2)}`;
    this.filters.lastDate = `${'03'}/${year.slice(2)}`;
    // this.filters = {
    //   firstDate: this.formatMonthYear(this.filters.firstDate),
    //   lastDate: this.formatMonthYear(this.filters.lastDate),
    //   paymentType: '', // Add appropriate default value
    //   status: '' // Add appropriate default value
    // };

  }

  formatMonthYear(dateString: string): string {
    const [year, month] = dateString.split('-');
    return `${month}/${year.slice(2)}`; // Formato "MM/YY" para la API
  }

  onInfoButtonClick() {
   this.modalService.open(this.infoModal, { size: 'lg' });
  }

  resetFilters(){
    this.initializeDefaultDates();
    this.filterData()
  }

  filterData(){
    this.main.getData()
    this.total.getData()
  }

  ngOnInit(): void {
    this.initializeDefaultDates();
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
    }
}
