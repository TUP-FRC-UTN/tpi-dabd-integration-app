import {Component, inject, OnInit} from '@angular/core';
import Category from "../../../models/category";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ExpensesBillsNavComponent} from "../../navs/expenses-bills-nav/expenses-bills-nav.component";
import {NgPipesModule} from "ngx-pipes";
import {CategoryService} from "../../../services/category.service";
import {NewCategoryModalComponent} from "../../modals/bills/new-category-modal/new-category-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {EditCategoryModalComponent} from "../../modals/bills/edit-category-modal/edit-category-modal.component";
import {DeleteCategoryModalComponent} from "../../modals/bills/delete-category-modal/delete-category-modal.component";
import {RouterLink} from "@angular/router";
import {BillInfoComponent} from "../../modals/info/bill-info/bill-info.component";
import {CategoryBillInfoComponent} from "../../modals/info/category-bill-info/category-bill-info.component";
import {ToastService} from "ngx-dabd-grupo01";

@Component({
  selector: 'app-category-bill',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ExpensesBillsNavComponent,
    NgPipesModule,
    RouterLink
  ],
  templateUrl: './category-bill.component.html',
  styleUrl: './category-bill.component.css'
})
export class CategoryBillComponent implements OnInit {
  categories: Category[] = [];
  searchTerm = '';
  isLoading = false;
  private toastService=inject(ToastService);
  private categoryService=inject(CategoryService);
  private modalService=inject(NgbModal);

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.categoryService.getAllCategories()
        .subscribe({
          next: (data) => {
            this.categories = data;
          },
          error: (error) => {
            this.toastService.sendError('Error al cargar categorías')
            // console.error('Error al cargar categorías:', error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }, 300);
  }

  openNewCategoryModal() {
    const modalRef = this.modalService.open(NewCategoryModalComponent);

    modalRef.result.then(
      (result) => {
        if (result?.success) {
          // Recargar categorías después de agregar una nueva
          this.loadCategories();
        }
      },
      () => {
        // Modal descartado
        console.log('Modal cerrado');
      }
    );
  }

  deleteCategory(category: Category) {
    const modalRef = this.modalService.open(DeleteCategoryModalComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.category = category;

    modalRef.result.then(
      (result) => {
        if (result?.success) {
          this.loadCategories(); // Recargar la lista después de eliminar
        }
      },
      () => {
        console.log('Modal de confirmación cerrado');
      }
    );
  }

  editCategory(category: Category) {
    const modalRef = this.modalService.open(EditCategoryModalComponent);
    modalRef.componentInstance.category = category;

    modalRef.result.then(
      (result) => {
        if (result?.success) {
          // Recargar categorías después de la actualización
          this.loadCategories();
        }
      },
      () => {
        console.log('Modal de edición cerrado');
      }
    );
  }

  showInfo(): void {
    this.modalService.open(CategoryBillInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });
  }
}
