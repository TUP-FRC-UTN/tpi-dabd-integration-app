import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { ExpensesExpensesNavComponent } from '../../navs/expenses-expenses-nav/expenses-expenses-nav.component';
import { ExpensesPeriodNavComponent } from '../../navs/expenses-period-nav/expenses-period-nav.component';
import { PeriodService } from '../../../services/period.service';
import Period from '../../../models/period';
import { NgClass } from '@angular/common';
import { ExpensesModalComponent } from '../../modals/expenses-modal/expenses-modal.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModalComponent } from '../../modals/ng-modal/ng-modal.component';
import { Page } from '../../../services/expense.service';
import { generateNumberArray } from '../../../utils/generateArrayNumber';
import { ExpensesStatePeriodStyleComponent } from '../../expenses-state-period-style/expenses-state-period-style.component';
import { FormsModule } from '@angular/forms';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { timeout } from 'rxjs';
import { ToastService } from 'ngx-dabd-grupo01';
import * as XLSX from 'xlsx';
import { NgPipesModule } from 'ngx-pipes';
import moment from 'moment';
import { InfoModalComponent } from "../../modals/info-modal/info-modal.component";

@Component({
  selector: 'app-expenses-period-list',
  standalone: true,
  imports: [ExpensesPeriodNavComponent, ExpensesStatePeriodStyleComponent, NgClass, ExpensesModalComponent, NgModalComponent, NgbModule, NgPipesModule, FormsModule, InfoModalComponent],
  templateUrl: './expenses-period-list.component.html',
  styleUrl: './expenses-period-list.component.css',
})
export class ExpensesPeriodListComponent implements OnInit {
  private readonly periodService: PeriodService = inject(PeriodService);
  listOpenPeriod: Period[] = [];
  listPeriod: Period[] = [];
  cantPages: number[] = [];
  indexActive = 1;
  size = 10;
  idClosePeriod: number | null = null;
  private state:string|null=null
  private modalService = inject(NgbModal);
  currentPage:number = 1
  typeFilter:string|null=null
  year:number|null = null
  month:number|null=null
  toastService:ToastService =inject(ToastService)
  ngOnInit(): void {
    this.loadPaged(1);
  }
  searchTerm = '';

  fileName = 'reporte-periodos-liquidaciones'


  showModal(content: TemplateRef<any>) {
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    });
  }


  loadPaged(page: number) {

    page =page -1
    this.periodService.getPage(this.size, page,this.state, this.month,this.year).subscribe((data) => {
      this.listPeriod = data.content;
      this.cantPages = generateNumberArray(data.totalPages)

    });
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.size = Number(selectElement.value);
    this.loadPaged(this.indexActive)
  }

  open(content: TemplateRef<any>, id: number | null) {
    this.idClosePeriod = id;
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.onAccept.subscribe(() => {
      this.closePeriod();
    });
     this.idClosePeriod = null;
  }

  changeIndex(cant: number) {
    this.indexActive = cant;
    this.loadPaged(cant);
  }

  changeStateQuery=(text:string|null)=>{
    this.state=text
    this.loadPaged(this.indexActive)
  }

  newPeriod() {
    this.periodService.new().subscribe((data) => {
      this.ngOnInit();
    });
  }
  openErrorModal(err:any) {
    const modalRef = this.modalService.open(NgModalComponent);
    modalRef.componentInstance.title = 'Error';
    modalRef.componentInstance.message = err?.error.message;
  }

  closePeriod() {
    console.log(this.idClosePeriod);

    if (this.idClosePeriod) {
      this.periodService
        .closePeriod(this.idClosePeriod)
        .subscribe({
          next: (data) => {
            // Aquí puedes manejar el éxito si es necesario
            console.log('Period closed successfully');
          },
          error: (err) => {
            console.log(err)
            if(err){
              this.toastService.sendError(err.error.message)
            } else{
              this.toastService.sendError("Ocurrio un error")
            }

          }
        });

      this.idClosePeriod = null;
    }
  }

  selectFilter(text:string|null){
    this.typeFilter=text
    this.year=null
    this.month=null
    this.searchTerm=''
    if(!text){
      this.loadPaged(1)
    }
  }
  search(): void {
    console.log(this.month,this.year)
      this.loadPaged(1)

  }
  updateYear(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.year = target && target.value ? parseInt(target.value, 10) : null;
  }

  updateMonth(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.month = target && target.value ? parseInt(target.value, 10) : null;
  }

  downloadTable() {
    this.periodService.getPage(500000, 0,this.state, this.month,this.year).subscribe(period => {
      // Mapear los datos a un formato tabular adecuado
      const data = period.content.map(peri => ({
        'Fecha':  `${peri.month + " / " + peri.year}`,
        'Total Extraordinarias': `${peri.ordinary?.amount?.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })||0}`,
        'Total Ordinarias': `${peri.extraordinary?.amount?.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })||0}`,
        'Estado': `${peri.state}`
      }));

      // Convertir los datos tabulares a una hoja de cálculo
      const fecha = new Date();
      console.log(fecha);
     const finalFileName = this.fileName+"-"+ moment(fecha).format("DD-MM-YYYY_HH-mm");

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Periodos de Liquidación');
      XLSX.writeFile(wb, `${finalFileName}.xlsx`);
    })
  }

  imprimir() {
    console.log('Imprimiendo')
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text('Reporte de Periodos de Liquidación', 14, 20);

    // Llamada al servicio para obtener las expensas
    this.periodService.getPage(500000, 0,this.state, this.month,this.year).subscribe(period => {
      // Usando autoTable para agregar la tabla
      autoTable(doc, {
        startY: 30,
        head: [['Fecha', 'Total Extraordinarias', 'Total Ordinarias', 'Estado']],
        body: period.content.map(peri => [
          peri.month + " / " + peri.year,
        peri.ordinary?.amount?.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })||0,
          peri.extraordinary?.amount?.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })||0,
          peri.state,
        ])
      });
      // Guardar el PDF después de agregar la tabla
      const fecha = new Date();
      console.log(fecha);
      const finalFileName = this.fileName+"-"+ moment(fecha).format("DD-MM-YYYY_HH-mm") +".pdf";
      doc.save(finalFileName);
      console.log('Impreso')
    });
  }
}
