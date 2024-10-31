import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillPostRequest } from '../../../models/bill-post-request';
import {Observable, map, of, switchMap} from "rxjs";
import Category from "../../../models/category";
import Period from "../../../models/period";
import { Provider } from "../../../models/provider";
import { CategoryService } from "../../../services/category.service";
import { ProviderService } from "../../../services/provider.service";
import { PeriodService } from "../../../services/period.service";
import { BillService } from "../../../services/bill.service";
import { AsyncPipe, NgClass } from "@angular/common";
import BillType from "../../../models/billType";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModalComponent } from '../../modals/ng-modal/ng-modal.component';
import { ExpensesBillsNavComponent } from "../../navs/expenses-bills-nav/expenses-bills-nav.component";
import { RouterLink } from "@angular/router";
import {BillInfoComponent} from "../../modals/info/bill-info/bill-info.component";
import {NewCategoryModalComponent} from "../../modals/bills/new-category-modal/new-category-modal.component";
import {ToastService} from "ngx-dabd-grupo01";
import {NgArrayPipesModule} from "ngx-pipes";



@Component({
  selector: 'app-add-bill',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AsyncPipe, NgClass, ExpensesBillsNavComponent, RouterLink, NgArrayPipesModule],
  templateUrl: './add-bill.component.html',
  styleUrl: './add-bill.component.css'
})
export class AddBillComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private providerService = inject(ProviderService);
  private periodService = inject(PeriodService);
  private billService = inject(BillService);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  billForm: FormGroup;
  newCategoryForm: FormGroup;
  @ViewChild('newCategoryModal') newCategoryModal: any;
  searchTerm: any;

  categories: Observable<Category[]> | undefined;
  providers: Observable<Provider[]> | undefined;
  periods: Observable<Period[]> | undefined;
  types: Observable<BillType[]> | undefined;

  constructor() {
    this.billForm = this.fb.group({
      categoryId: ['', Validators.required],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0.0001)]],
      date: ['', Validators.required],
      supplierId: ['', [Validators.required]],
      typeId: ['', [Validators.required]],
      periodId: ['', [Validators.required]]
    });

    this.newCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    this.loadSelectOptions();
  }

  loadSelectOptions() {
    this.categories = this.categoryService.getAllCategories();
    this.providers = this.providerService.getAllProviders();
    this.periods = this.periodService.get();
    this.types = this.billService.getBillTypes();
  }

  onSubmit() {
    if (this.billForm.valid) {
      of(this.billForm.value).pipe(
        map(formValue => {
          const billRequest = new BillPostRequest();
          billRequest.categoryId = Number(formValue.categoryId);
          billRequest.description = formValue.description;
          billRequest.amount = Number(formValue.amount);
          billRequest.date = `${formValue.date}T00:00:00Z`;
          billRequest.status = 'ACTIVE';
          billRequest.supplierId = Number(formValue.supplierId);
          billRequest.supplierEmployeeType = 'SUPPLIER';
          billRequest.typeId = Number(formValue.typeId);
          billRequest.periodId = Number(formValue.periodId);
          billRequest.linkPdf = '';
          return billRequest;
        }),
        switchMap(billRequest => this.billService.addBill(billRequest))
      ).subscribe({
        next: (response: any) => {
          console.log('Añadido correctamente', response);
          this.toastService.sendSuccess('El gasto se ha añadido correctamente.');
          // this.showModal('Éxito', 'El gasto se ha añadido correctamente.');
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Error en el post', error);
          if (error.status === 409) {
            this.toastService.sendError('Datos incorrectos/inexistentes. Por favor, intentelo de nuevo.')
            // this.showModal('Error', 'Datos incorrectos/inexistentes. Por favor, intentelo de nuevo.');
          } else {
            this.toastService.sendError(error.error.message)
            // this.showModal('Error', 'Ha ocurrido un error al añadir el gasto. Por favor, inténtelo de nuevo.');
          }
        }
      });
    } else {
      console.log('Formulario inválido');
      this.toastService.sendError('Por favor, complete todos los campos requeridos correctamente.')
      // this.showModal('Error', 'Por favor, complete todos los campos requeridos correctamente.');
    }
  }

  resetForm() {
    this.billForm.reset();
    this.loadSelectOptions();
  }

  /*showModal(title: string, message: string) {
    const modalRef = this.modalService.open(NgModalComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
  }*/

  openNewCategoryModal() {
    const modalRef = this.modalService.open(NewCategoryModalComponent, {
      ariaLabelledBy: 'modal-basic-title'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          if (result.success) {
            this.toastService.sendSuccess(result.message);
            this.loadSelectOptions();
          } else {
            this.toastService.sendError(result.message);
            // this.showModal('Error', result.message);
          }
        }
      }
    );
  }

  showInfo(): void {
    this.modalService.open(BillInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });
  }
}
