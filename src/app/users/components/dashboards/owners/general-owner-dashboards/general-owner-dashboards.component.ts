import {Component, inject, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MainContainerComponent} from "ngx-dabd-grupo01";
import {NgbModal, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {GoogleChartsModule} from "angular-google-charts";
import {NgClass} from "@angular/common";
import {DashboardOwnerStatus, OwnerDashboardFilter} from '../../../../models/dashboard.model';
import {BarchartComponent} from '../../commons/barchart/barchart.component';
import {OwnerService} from '../../../../services/owner.service';
import {KpiComponent} from '../../commons/kpi/kpi.component';
import {MainDashboardComponent} from '../main-dashboard/main-dashboard.component';
import {PersonDashboardComponent} from '../person-dashboard/person-dashboard.component';
import {CompanyDashboardComponent} from '../company-dashboard/company-dashboard.component';
import {OtherDashboardComponent} from '../other-dashboard/other-dashboard.component';
import {DocumentTypeDictionary, OwnerStatusDictionary, OwnerTypeDictionary} from '../../../../models/owner';

@Component({
  selector: 'app-general-owner-dashboards',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MainContainerComponent, GoogleChartsModule, KpiComponent, NgClass, NgbPopover, MainDashboardComponent, PersonDashboardComponent, CompanyDashboardComponent, OtherDashboardComponent],
  templateUrl: './general-owner-dashboards.component.html',
  styleUrl: './general-owner-dashboards.component.scss'
})
export class GeneralOwnerDashboardsComponent {
//filters
  filters:OwnerDashboardFilter = {} as OwnerDashboardFilter
  dictionaries: any[] = [OwnerStatusDictionary, OwnerTypeDictionary, DocumentTypeDictionary]
  //dashboard settings
  status: DashboardOwnerStatus = DashboardOwnerStatus.All;


  //services
  modalService = inject(NgbModal);


  //Childs
  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(PersonDashboardComponent) person!: PersonDashboardComponent;
  @ViewChild(CompanyDashboardComponent) company!: CompanyDashboardComponent;
  @ViewChild(OtherDashboardComponent) other!: OtherDashboardComponent;

  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;


  protected ownerService = inject(OwnerService)

  initializeDefaultDates(){
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.dateTo = now.toISOString().slice(0, 16);

    now.setDate(now.getDate() - 14);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.dateFrom = now.toISOString().slice(0, 16);
    this.filters.ownerType=""
  }


  resetFilters(){
    this.status = DashboardOwnerStatus.All
    this.initializeDefaultDates();
    this.filterData()
  }

  filterData(){
    switch (this.filters.ownerType) {
      case "PERSON":
        this.status = DashboardOwnerStatus.Person
        break;
      case "COMPANY":
        this.status = DashboardOwnerStatus.Company
        break;
      case "OTHER":
        this.status = DashboardOwnerStatus.Other
        break;
    }
    this.main.getData()
    this.person.getData();
    this.other.getData();
    this.company.getData()
  }

  changeMode(event: any){
    const statusKey = Object.keys(DashboardOwnerStatus).find(key => DashboardOwnerStatus[key as keyof typeof DashboardOwnerStatus] === event);

    if (statusKey) {
      this.status = DashboardOwnerStatus[statusKey as keyof typeof DashboardOwnerStatus];
    } else {
      console.error('Valor no válido para el enum');
    }
  }
  protected readonly DashboardStatus = DashboardOwnerStatus;

  ngAfterViewInit(): void {
    this.initializeDefaultDates();
    this.filterData()
  }

  onInfoButtonClick() {

  }
}
