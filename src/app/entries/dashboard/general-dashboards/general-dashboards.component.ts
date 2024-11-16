/**
 * @description Componente principal para la visualización de dashboards con implementación de lazy loading
 * @implements OnInit, AfterViewInit
 */
import {AfterViewInit, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MainContainerComponent} from "ngx-dabd-grupo01";
import {NgbModal, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {KpiComponent} from "../commons/kpi/kpi.component";
import {MainDashboardComponent} from "../components/main-dashboard/main-dashboard.component";
import {EntriesDashboardComponent} from "../components/entries-dashboard/entries-dashboard.component";
import {LateDashboardComponent} from "../components/late-dashboard/late-dashboard.component";
import {TypesDashboardComponent} from "../components/types-dashboard/types-dashboard.component";
import {InconsistenciesDashboardComponent} from "../components/inconsistencies-dashboard/inconsistencies-dashboard.component";
import {BarchartComponent} from "../commons/barchart/barchart.component";
import {NgClass} from "@angular/common";
import { GoogleChartsModule } from 'angular-google-charts';
import { DashBoardFilters, DashboardStatus } from '../../models/dashboard/dashboard.model';
import { AccessService } from '../../services/access/access.service';
import { AccessHourlyDashboardComponent } from '../../accesses/features/access-hourly-dashboard/access-hourly-dashboard/access-hourly-dashboard.component';
import { AccessWeeklyDashboardComponent } from '../../accesses/features/access-weekly-dashboard/access-weekly-dashboard/access-weekly-dashboard.component';
import { AccessPieDashboardComponent } from '../../accesses/features/access-pie-dashboard/access-pie-dashboard/access-pie-dashboard.component';

@Component({
  selector: 'app-general-dashboards',
  standalone: true,
  /**
   * @imports Lista de componentes y módulos necesarios
   * Los componentes de dashboard se importan acá pero se cargarán de manera perezosa
   * a través de la directiva @defer en el template
   */
  imports: [
    AccessHourlyDashboardComponent, 
    AccessWeeklyDashboardComponent, 
    AccessPieDashboardComponent, 
    ReactiveFormsModule, 
    FormsModule, 
    MainContainerComponent, 
    GoogleChartsModule, 
    KpiComponent, 
    MainDashboardComponent, 
    EntriesDashboardComponent, 
    LateDashboardComponent, 
    TypesDashboardComponent, 
    InconsistenciesDashboardComponent, 
    NgClass, 
    NgbPopover
  ],
  templateUrl: './general-dashboards.component.html',
  styleUrl: './general-dashboards.component.css'
})
export class GeneralDashboardsComponent implements OnInit, AfterViewInit{
  /** Objeto de filtros para los dashboards */
  filters:DashBoardFilters = {} as DashBoardFilters

  /** Estado actual del dashboard que determina qué componente se carga */
  status: DashboardStatus = DashboardStatus.All;

  /** Servicio para manejo de modales */
  modalService = inject(NgbModal);

  /**
   * Referencias a los componentes que serán cargados de manera perezosa
   * @ViewChild se usa para obtener referencias a los componentes cuando son cargados
   */
  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(EntriesDashboardComponent) entries!: EntriesDashboardComponent;
  @ViewChild(LateDashboardComponent) late!: LateDashboardComponent;
  @ViewChild(TypesDashboardComponent) types!: TypesDashboardComponent;
  @ViewChild(InconsistenciesDashboardComponent) inconsistencies!: InconsistenciesDashboardComponent;
  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>


  /**
   * @constructor
   * @param accessService Servicio para manejo de datos de acceso
   */
  constructor(private accessService: AccessService) {}

  /**
   * Inicializa las fechas por defecto para los filtros
   * @returns void
   */

  initializeDefaultDates() {
    this.filters.group = "DAY";
    this.filters.type = "";
    this.filters.action = "ENTRY";
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.dateTo = now.toISOString().slice(0, 16);

    now.setDate(now.getDate() - 14);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.dateFrom = now.toISOString().slice(0, 16);
  }

  /**
   * Maneja la apertura del modal de información
   * @returns void
   */
  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
  }

  /**
   * Resetea los filtros a sus valores por defecto
   * @returns void
   */
  resetFilters() {
    this.initializeDefaultDates();
    this.filters.type = "";
    this.filters.group = "DAY"
    this.filters.action = "ENTRY"
    this.filterData()
  }

  /**
   * Actualiza los datos en todos los componentes cargados
   * Se ejecuta cuando cambian los filtros
   * @returns void
   */
  filterData() {
    // Los componentes solo se actualizarán si han sido cargados por el lazy loading
    this.main?.getData();
    this.entries?.getData();
    this.types?.getData();
    this.inconsistencies?.getData();
    this.late?.getData();

  }

  /**
   * Implementación del hook OnInit
   * @returns void
   */
  ngOnInit(): void {
    this.initializeDefaultDates();
    this.filterData()
  }

  /**
   * Maneja el cambio de modo/vista del dashboard
   * Esto activará la carga perezosa del componente correspondiente
   * @param event Evento que contiene el nuevo modo
   * @returns void
   */
  changeMode(event: any) {
    const statusKey = Object.keys(DashboardStatus).find(key => 
      DashboardStatus[key as keyof typeof DashboardStatus] === event
    );

    if (statusKey) {
      this.status = DashboardStatus[statusKey as keyof typeof DashboardStatus];
    } else {
      console.error('Valor no válido para el enum');
    }

    this.types?.getData();
  }

  /** Referencia al enum DashboardStatus para uso en el template */
  protected readonly DashboardStatus = DashboardStatus;

  /**
   * Implementación del hook AfterViewInit
   * Se ejecuta después de que las vistas han sido inicializadas
   * @returns void
   */
  ngAfterViewInit(): void {


  }

  /**
   * Obtiene la fecha y hora actual formateada
   * @returns string Fecha y hora actual en formato ISO
   */
  getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}