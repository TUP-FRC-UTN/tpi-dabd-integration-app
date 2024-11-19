import { Component, OnInit, ViewChild, TemplateRef, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent, ConfirmAlertComponent, ToastService } from 'ngx-dabd-grupo01';
import { ArticleCateg } from '../../../../models/article.model';
import { InventoryService } from '../../../../services/inventory.service';
import { ArticleCategoryUpdateComponent } from './article-category-update/article-category-update.component';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { StatusType } from '../../../../models/inventory.model';

@Component({
  selector: 'app-inventory-article-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MainContainerComponent,
    ArticleCategoryUpdateComponent,
    ConfirmAlertComponent
  ],
  templateUrl: './inventory-article-category-list.component.html',
  styleUrls: ['./inventory-article-category-list.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InventoryArticleCategoryListComponent implements OnInit {
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  showModalFilter: boolean = false;
  searchFilter: FormControl = new FormControl('');
  categories: ArticleCateg[] = [];
  filteredCategories: ArticleCateg[] = [];
  originalCategories: ArticleCateg[] = [];
  isLoading = false;
  selectedCategory: ArticleCateg | null = null;
  showCategoryUpdate: boolean = false;
  statusType?: StatusType;

  // Formulario de filtros
  filterForm: FormGroup;
  selectedStatusFilter: string = ''; // Filtro de estado

  private modalService = inject(NgbModal);


  constructor(
    private inventoryService: InventoryService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      denomination: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories(): void {
    this.isLoading = true;
    this.inventoryService.getArticleCategories().subscribe(
      (response: ArticleCateg[]) => {
        this.originalCategories = response;
        this.categories = [...this.originalCategories];
        this.filteredCategories = [...this.originalCategories];
        this.isLoading = false;
        this.applyFilters(); // Aplicar filtro inicial si ya hay algún valor
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
        this.toastService.sendError('Error al cargar las categorías.');
        this.isLoading = false;
      }
    );
  }

  applyFilters(): void {
    const searchText = this.searchFilter.value ? this.searchFilter.value.toLowerCase() : '';
    this.filteredCategories = this.originalCategories.filter(category => {
      const matchesDenomination = category.denomination.toLowerCase().includes(searchText);
      const matchesStatus = this.selectedStatusFilter ? category.status === this.selectedStatusFilter : true;
      return matchesDenomination && matchesStatus;
    });
    this.categories = [...this.filteredCategories];
  }

  filterByStatus(status: string): void {
    this.selectedStatusFilter = status;
    this.applyFilters();
  }


  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  openModalFilter(): void {
    this.modalService.open(this.infoModal, { centered: true });
  }

  closeModalFilter(): void {
    this.modalService.dismissAll();
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Denominación', 'Estado']],
      body: this.categories.map(category => [
        category.denomination,
        category.status.toString() === 'ACTIVE' ? 'Activo' : 'Inactivo'
      ])
    });
    doc.save('categorias-de-articulos.pdf');
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.categories.map(category => ({
      Denominación: category.denomination,
      Estado: category.status.toString() === 'ACTIVE' ? 'Activo' : 'Inactivo'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorías');
    XLSX.writeFile(workbook, 'categorias-de-articulos.xlsx');
  }

  deleteCategory(id: number): void {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = '¿Estás seguro de eliminar esta categoría? Esta acción no se puede revertir.';
    modalRef.componentInstance.alertVariant = 'delete';

    modalRef.result.then((result) => {
      if (result) {
        this.inventoryService.deleteCategories(id).subscribe({
          next: () => {
            this.getCategories(); // Recarga la lista de categorías después de la eliminación.
            this.toastService.sendSuccess('La categoría ha sido eliminada con éxito.');
          },
          error: () => {
            this.toastService.sendError('Error al eliminar la categoría.');
          }
        });
      }
    }).catch(() => {
      console.log('Eliminación cancelada por el usuario.');
    });
  }


  onCategoryUpdate(category?: ArticleCateg): void {
    this.selectedCategory = category || null;
    this.showCategoryUpdate = true;
  }

  onCategoryUpdateClose(): void {
    this.showCategoryUpdate = false;
    this.selectedCategory = null;
    this.getCategories();
  }

  showInfo(){
    this.modalService.open(this.infoModal, { centered: true });
  }
}
