import { Component, ElementRef, inject, NgModule, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Charge, ChargeFilters, PeriodCharge } from '../../../models/charge';
import { ChargeService } from '../../../services/charge.service';
import { CategoryCharge } from '../../../models/charge';
import { UpdateChargeComponent } from '../update-charge/update-charge.component';
import { CommonModule } from '@angular/common';
import { PeriodSelectComponent } from '../../selects/period-select/period-select.component';
import Lot from '../../../models/lot';
import { LotsService } from '../../../services/lots.service';
import { PeriodService } from '../../../services/period.service';
import { BorrarItemComponent } from '../../modals/borrar-item/borrar-item.component';
import { ExpensesChargesNavComponent } from '../../navs/expenses-charges-nav/expenses-charges-nav.component';
import { ExpensesBillsNavComponent } from '../../navs/expenses-bills-nav/expenses-bills-nav.component';
//import $ from "jquery";
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
//import * as XLSX from 'xlsx'
import * as XLSX from 'xlsx';   // Para exportar a Excel
import jsPDF from 'jspdf';      // Para exportar a PDF
//import 'jspdf-autotable';       // Para generar tablas en PDF
import moment from 'moment';
//import { Subject } from 'rxjs';
//import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, takeUntil, max } from 'rxjs/operators';
// import 'datatables.net';
// import 'datatables.net-bs5';
// import 'bootstrap';
import { NgModalComponent } from '../../modals/ng-modal/ng-modal.component';
import { ExpensesModalComponent } from '../../modals/expenses-modal/expenses-modal.component';
import Period from '../../../models/period';
import {NgPipesModule} from "ngx-pipes";
import { TableComponent, ToastService } from 'ngx-dabd-grupo01';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-list-charges',
  standalone: true,
  imports: [UpdateChargeComponent, CommonModule, PeriodSelectComponent, ExpensesBillsNavComponent, 
    ExpensesChargesNavComponent,FormsModule,ReactiveFormsModule,NgPipesModule,TableComponent, ExpensesModalComponent,
  NgbModule],
  templateUrl: './list-charges.component.html',
  styleUrl: './list-charges.component.css',
})

export class ListChargesComponent implements OnInit {
  searchTerm = '';
  selectedLotId: number = 0;
  selectedCategoryId: number = 0;
  selectedPeriodId: number = 0;

  charges: Charge[] = []
  chargeId : number = 0;
  lots : Lot[] = []
  categorias: CategoryCharge[] = []
  periodos : Period[] = []

  //Criterios de Filtros
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo : string[] = []
  actualFilter : string | undefined = ChargeFilters.NOTHING;
  filterTypes = ChargeFilters;
  filterInput : string = "";

  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  cantPages: number[] = [];
  indexActive = 1;
  isLoading : Boolean = true;
  applyFilters() {
    this.currentPage = 0;
    this.cargarPaginado();
  }
  clearFilters(){
    this.selectedCategoryId = 0;
    this.selectedLotId = 0;
    this.selectedPeriodId = 0;
    this.cargarPaginado();
    this.searchTerm = "";

  }

  imprimir() {
    console.log('Imprimiendo')
    const doc = new jsPDF();
    
    // Título del PDF
    doc.setFontSize(18);
    doc.text('Reporte de Cargos ', 14, 20);
    

    // Llamada al servicio para obtener las expensas
    this.chargeService.getCharges(0, 100000, this.selectedPeriodId, this.selectedLotId, this.selectedCategoryId).subscribe(charges => {
      // Usando autoTable para agregar la tabla
      console.log(charges.content);
      autoTable(doc, {
        startY: 30,
        head: [['Fecha', 'Periodo', 'Lote', 'Categoría', 'Descripción', 'Monto']],
        body: charges.content.map(charge => [
          moment(charge.date).format("DD/MM/YYYY"),
          charge.period.month + '/' + charge.period.year,          
          this.getPlotNumber(charge.lotId) || 'N/A', // Manejo de undefined
          charge.categoryCharge.name,
          charge.description,
          charge.amount
          
        ]),
      });

      // Guardar el PDF después de agregar la tabla
      const fecha = new Date();
      console.log(fecha);
      this.fileName += "-"+ fecha.getDate()+"_"+(fecha.getMonth()+1)+"_"+fecha.getFullYear()+".pdf";
      doc.save(this.fileName);
      console.log('Impreso')
    }); 
  }
    
  downloadTable() {
    this.chargeService.getCharges(0, 100000, this.selectedPeriodId, this.selectedLotId, this.selectedCategoryId).subscribe(charges => {
      // Mapear los datos a un formato tabular adecuado
      const data = charges.content.map(charge => ({
        'Fecha de Carga': moment(charge.date).format("DD/MM/YYYY"),
        'Periodo':  `${charge?.period?.month} / ${charge?.period?.year}`,
        'Número de lote': this.getPlotNumber(charge.lotId),
        'Categoría': charge.categoryCharge.name,
        'Descripción': charge.description,
        'Monto': charge.amount,
        'Estado': charge.status,
      }));
  
      // Convertir los datos tabulares a una hoja de cálculo
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cargos');
      var fecha = new Date();
      this.fileName += "-"+fecha.getDate()+"_"+(fecha.getMonth()+1)+"_"+fecha.getFullYear()+".xlsx"
      XLSX.writeFile(wb, this.fileName);
    });
  }
  open(content: TemplateRef<any>, id: number | null) {
    //this.idClosePeriod = id;    
    this.chargeId = id!;
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.onAccept.subscribe(() => {
      debugger
      this.deleteCharge(this.chargeId);
    });   
     //this.idClosePeriod = null;
  }

  deleteCharge2(){
    if(this.chargeId != 0){
      this.deleteCharge(this.chargeId);
    }
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.pageSize = Number(selectElement.value);
    //this.loadPaged(this.indexActive)
    //this.cargarPaginado();
  }

  addCharge(){
    this.router.navigate([`cargos/nuevo`])
  }

  ngOnInit(): void {
    //$.noConflict();
    this.loadSelect();
    this.loadCategoryCharge();  
    this.cargarPaginado()
    //this.loadCharges(0,10);
    //this.configDataTable();
  }

  //COMPONENTES VIEJOS FIJARSE QUE VOY  A SEGUIR UTILIZANDO
  //charges: Charge[] = [];
  //INYECCION DE SERVICIOS
  private chargeService = inject(ChargeService);
  private modalService = inject(NgbModal);
  private readonly router = inject(Router);
  private readonly periodService = inject(PeriodService);
  private readonly lotsService = inject(LotsService);
  toastService:ToastService = inject(ToastService)

  selectedCharge: Charge | null = null;
  selectedCharges: number[] = [];
  categoryCharges: CategoryCharge[] = [];
  params : number[] = [];

  //rowsPerPage = 10;
  //lots: Lot[] = [];

  datatable : any;
  //private dateChangeSubject = new Subject<{ from: string, to: string }>();
  fileName : string = "Cargos";



  //filtros : FormGroup;

  @ViewChild('exampleModal') exampleModal!: ElementRef;

  constructor() {}

  // openModal() {
  //   const modal = new b.Modal(this.exampleModal.nativeElement);
  //   modal.show();
  // }

  

  loadCharges(page:number,pageSize:number): void {
    
    if(this.lots.length !=0) {
      this.params.push();

    }
    this.chargeService.getCharges(page,pageSize,undefined,undefined,undefined).subscribe((charges) => {
      this.charges = charges.content;
      console.log(charges);
      console.log(this.currentPage);
      //this.configDataTable();
    });
    
  }
  onPageChange(page: number): void {
    console.log(this.totalPages)
    if (page >= 0 && page < this.totalPages) {
    
      console.log('Cargando página ' + page);
      this.loadCharges(page,this.pageSize);
      this.currentPage = page; // Asegúrate de actualizar currentPage aquí
    }
  }
  // Función que se ejecuta cuando cambia el número de registros por página
  changesPageSize(newRowsPerPage: number) {
    console.log('Número de registros por página cambiado a:', newRowsPerPage);
    this.currentPage = 0;  // Reinicia la paginación a la primera página
    this.pageSize = newRowsPerPage;  // Actualiza el número de registros por página
    this.cargarPaginado();
  }
  cargarPaginado() {
    console.log("Periodo Id: " + this.selectedPeriodId);
    console.log("Categoria Id: " + this.selectedCategoryId);
    console.log("Lote Id: " + this.selectedLotId);
    var period = undefined;
    var category = undefined;
    var lot = undefined;
    if(this.selectedPeriodId != 0){
      period = this.selectedPeriodId 
    }
    if(this.selectedCategoryId != 0){
      category = this.selectedCategoryId 
    }
    if(this.selectedLotId != 0){
      lot = this.selectedLotId 
    }

    // Llamar al servicio con la paginación desde el backend.
    this.chargeService.getCharges(this.currentPage, this.pageSize, period, lot,category).subscribe(response => {

      console.log("Cargos :" + JSON.stringify(response.content));
      this.charges = response.content;  // Datos de la página actual
      this.totalPages = response.totalPages;  // Número total de páginas
      this.totalItems = response.totalElements;  // Total de registros
      this.currentPage = response.number;
      console.log(this.charges);
    });
    
  }

  showInfo(){
    
  }

  isClosed(period : PeriodCharge) : boolean {
    debugger;
    if(period.state === 'closed'){
      return true;
    }
    return false;
  }
  getPlotNumber(lotId : number){
    const lot = this.lots.find(lot => lot.id === lotId);
    return lot ? lot.plot_number : undefined;
  }

  loadSelect() {
    this.periodService.get().subscribe((data: Period[]) => {
      this.periodos = data;
    })
    this.lotsService.get().subscribe((data: Lot[]) => {
      this.lots = data;
    })
  }
  loadCategoryCharge(){
    this.chargeService.getCategoryCharges().subscribe((data: CategoryCharge[]) => {
      this.categorias = data;
    })
  }

  openViewModal(charge: Charge) {
    
    const modalRef = this.modalService.open(UpdateChargeComponent);
    modalRef.componentInstance.charge = charge;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.toastService.sendSuccess("Se actualizo el cargo correctamente")
          this.currentPage = 0;
          this.cargarPaginado();
        }
      },
      () => {}
    );
  }

  openDeleteModal(chargeId: number) {
    const modalRef = this.modalService.open(BorrarItemComponent);
    modalRef.componentInstance.chargeId = chargeId;

    modalRef.result.then(
      (result) => {
        if (result) {
          debugger
          this.deleteCharge(result);
          
          this.cargarPaginado();
        }
      },
      () => {}
    );
  }

  deleteCharge(chargeId: number) {
    this.chargeService.deleteCharge(chargeId).subscribe({
        next: () => {
            this.currentPage = 0;
            this.clearFilters();
            this.cargarPaginado();
            this.toastService.sendSuccess("Se ha elimado el cargo correctamente");
        },
        error: (err: Error) => {
          this.toastService.sendError("Ha ocurrido un error al eliminar el cargo");
        }
    });
    this.chargeId = 0;
}

  

  openUpdateModal(charge: Charge) {
    const modalRef = this.modalService.open(UpdateChargeComponent);
    modalRef.componentInstance.charge = charge;
    modalRef.componentInstance.isEditing = true;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.currentPage = 0;
          this.cargarPaginado();
          this.toastService.sendSuccess("Se ha actualizado el cargo correctamente");
        }
      },
      () => {}
    );
  }
    

}
