import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalLiquidationDetailComponent } from './modal-liquidation-detail/modal-liquidation-detail.component';
import { LiquidationExpenseService } from '../../../services/liquidation-expense.service';
import LiquidationExpense from '../../../models/liquidationExpense';
import { FormsModule } from '@angular/forms';
import { InfoModalComponent } from '../../modals/info-modal/info-modal.component';
import { NgModalComponent } from '../../modals/ng-modal/ng-modal.component';
import { BillService } from '../../../services/bill.service';
import { Bill } from '../../../models/bill';
import { CategoryService } from '../../../services/category.service';
import Category from '../../../models/category';
import { NgPipesModule } from 'ngx-pipes';
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

@Component({
  selector: 'app-liquidation-expense-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    CommonModule,
    FormsModule,
    InfoModalComponent,
    NgModalComponent,
    NgPipesModule,
    NgbModule
],
  templateUrl: './liquidation-expense-details.component.html',
  styleUrl: './liquidation-expense-details.component.css'
})
export class LiquidationExpenseDetailsComponent implements OnInit{

  private readonly location = inject(Location);
  private readonly service = inject(LiquidationExpenseService);
  private readonly billsService = inject(BillService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private modalService = inject(NgbModal);
  private readonly categoryService = inject(CategoryService);
  cantPages:number=10
  liquidationExpense: LiquidationExpense = new LiquidationExpense();
  bills: Bill[] = [];
  categories: Category[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  pages: number[] = [];

  category: number | null = null;
  period: number | null = null;
  type: number | undefined = undefined;

  typeFilter: string = '';

  searchTerm: string = '';

  fileName = 'reporte-gastos-liquidación'

  ngOnInit(): void {
    this.loadLiquidationExpenseDetails();
    this.loadCategories();
  }

  private loadCategories() {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    })
  }

  private loadLiquidationExpenseDetails() {
    this.route.paramMap.subscribe(params => {
      const periodId = params.get('period_id');
      const id = params.get('id');
      if (id && !isNaN(Number(id))) {
        this.service.getById(Number(id)).subscribe((data: LiquidationExpense) => {
          this.liquidationExpense = data;
          this.type = data.bill_type?.bill_type_id

          if (periodId && !isNaN(Number(periodId))) {
            this.period = parseInt(periodId);
          }

          this.getBills(this.itemsPerPage, this.currentPage, this.period, this.category, this.type, "ACTIVE")
        });
      }
    });
  }

  private getBills(itemsPerPage: number, page: number, period: number | null, category: number | null, type: number | undefined, status: string) {
    if (type != undefined) {
      this.billsService.getAllBillsPaged(itemsPerPage, page -1, period, category, type, status).subscribe(data => {
        this.bills = data.content;
        this.cantPages = data.totalElements
      })
    } else console.log("No hay un tipo de expensa definido");
  }



  goBack() {
    this.location.back();
  }


  //
  // Pagination
  //

  initializePagination() {
    this.totalItems = this.liquidationExpense.liquidation_expenses_details.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
    this.getBills(this.itemsPerPage,this.currentPage,this.period,this.category,this.type, "ACTIVE")
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.initializePagination();
  }

  //
  // PDF Y Excel
  //

  downloadTable() {
    this.billsService.getAllBillsPaged(this.itemsPerPage, this.currentPage -1, this.period, this.category, this.type||null, "ACTIVE").subscribe(bill => {
      // Mapear los datos a un formato tabular adecuado
      const data = bill.content.map(bill => ({
        'Categoría':  `${bill.category.name}`,
        'Fecha': `${bill.date}`,
        'Proveedor': `${bill.supplier.name}`,
        'Monto': `${bill.amount}`,
        'Descripción': `${bill.description}`,
      }));

      const fecha = new Date();
      console.log(fecha);
     const finalFileName = this.fileName+"-"+ moment(fecha).format("DD-MM-YYYY_HH-mm");

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Gastos de Liquidación');
      XLSX.writeFile(wb, `${finalFileName}.xlsx`);
    })
  }

  imprimir() {
    console.log('Imprimiendo')
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text('Reporte de Gastos de Liquidación', 14, 20);

    // Llamada al servicio para obtener las expensas
    this.billsService.getAllBillsPaged(this.itemsPerPage, this.currentPage -1, this.period, this.category, this.type||null, "ACTIVE").subscribe(bill => {
      // Usando autoTable para agregar la tabla
      autoTable(doc, {
        startY: 30,
        head: [['Categoría', 'Fecha', 'Proveedor', 'Monto', 'Descripcion']],
        body: bill.content.map(bill => [
          bill.category?.name || 'N/A',
          bill.date instanceof Date
            ? bill.date.toLocaleDateString()
            : new Date(bill.date).toLocaleDateString() || 'N/A',
          bill.supplier?.name || 'N/A',
          bill?.amount?.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) || "N/A",
          bill?.description || 'N/A',
        ]),
      });

       // Guardar el PDF después de agregar la tabla
       const fecha = new Date();
       console.log(fecha);
       const finalFileName = this.fileName+"-"+ moment(fecha).format("DD-MM-YYYY_HH-mm") +".pdf";
       doc.save(finalFileName);
       console.log('Impreso')
    });
  }


  //
  // Modal
  //

  openModal() {
    const modalRef = this.modalService.open(ModalLiquidationDetailComponent);
  }

  showModal(content: TemplateRef<any>) {
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    });
  }



  edit(id: number | null) {
    console.log(id);

    if (id == null) return;
    this.router.navigate([`gastos/modificar/${id}`])
  }

  selectFilter(text:string){
    this.typeFilter=text
  }

  handleCategoryChange(id: number) {
    this.category = id;
    this.getBills(this.itemsPerPage, this.currentPage, this.period, this.category, this.type, "ACTIVE")
  }

  clean() {
    this.category = null;
    this.typeFilter = '';
    this.searchTerm = '';
    this.getBills(this.itemsPerPage, this.currentPage, this.period, this.category, this.type, "ACTIVE")
  }
}
