import { ChangeDetectorRef, Component, Inject, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MainContainerComponent } from "ngx-dabd-grupo01";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { GoogleChartsModule } from "angular-google-charts";
import { KpiComponent } from "../commons/kpi/kpi.component";

import { CommonModule, NgClass } from "@angular/common";
import {DashboardStatus, PaymentFilter, TicketFilter} from '../../models/stadistics';
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
    CommonModule
  ],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent implements OnInit {

  //filters
  ticketFilter: TicketFilter = {} as TicketFilter
  paymentFilter: PaymentFilter = {} as PaymentFilter
  // filters: DashBoardFilters = {} as DashBoardFilters;

  //dashboard settings
  status: DashboardStatus = DashboardStatus.All;


  //services
  modalService = inject(NgbModal);


  //Childs
  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(TotalPaymentsComponent) payments!: TotalPaymentsComponent;


  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;

  @ViewChild('infoModal') infoModal!: TemplateRef<any>
  dateFilterForm: FormGroup;
  dateFilterFormPayments: FormGroup;


  constructor(private fb: FormBuilder,
    private stadisticsService: StadisticsService,
    @Inject(ChangeDetectorRef) private cdr: ChangeDetectorRef) {

    this.dateFilterForm = this.fb.group({
      firstDate: [''],
      lastDate: ['']
    });
    this.dateFilterFormPayments = this.fb.group({
      firstDate: [''],
      lastDate: ['']
    });
  }
  // INICIAMOS COMPONENTE CON FORMULARIO NUEVO Y CARGA DE FECHA INICIAL ACTUAL FORMATO "YYYY-MM"
  ngOnInit(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    this.dateFilterForm.patchValue({
      firstDate: currentMonth
    });


    this.dateFilterForm.get('firstDate')?.valueChanges.subscribe(value => {
      // this.filterData();
    });

    this.dateFilterForm.get('lastDate')?.valueChanges.subscribe(value => {
      // this.filterData();
    });

    this.dateFilterForm.valueChanges.subscribe(values => {
      // this.filterData();
    });
  }

  ngAfterViewInit(): void {
    this.filterData();
    this.filterDataPayment()
    this.cdr.detectChanges(); // Fuerza la detección de cambios
  }

  onDateChange(){
    this.filterData();
  }

  initializeDefaultDates() {
      // this.dateFilterForm.patchValue({
      //   firstDate: "2024-01",
      //   lastDate: "2024-03"
      // })

      this.ticketFilter = {
        status: "",
        startExpirationDate: "",
        endExpirationDate: ""
      };

      this.filterData();
    }

  resetFilters() {
    this.initializeDefaultDates();
    this.filterData()
  }

  filterData() {
    this.main.getData()
  }

  filterDataPayment() {
    this.payments.getData()
  }

  resetFiltersPayment() {
    this.initializeDefaultDatesPayment();
  }

  initializeDefaultDatesPayment() {
    this.paymentFilter = {
      status: "",
      paymentMethod: "",
      startCreatedAt: "",
      endCreatedAt: ""
    }

    this.filterDataPayment()
  }

  protected readonly DashboardStatus = DashboardStatus;


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


  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
  }
}
