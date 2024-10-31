import { Component, inject, Input, OnInit, ViewChild} from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Bill } from '../../../../models/bill';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProviderService } from '../../../../services/provider.service';
import { CategoryService } from '../../../../services/category.service';
import { PeriodService } from '../../../../services/period.service';
import Category from '../../../../models/category';
import Period from '../../../../models/period';
import { BillService } from '../../../../services/bill.service';
import BillType from '../../../../models/billType';
import { Provider } from '../../../../models/provider';
import { CommonModule } from '@angular/common';
import { NgModalComponent } from '../../ng-modal/ng-modal.component';

@Component({
  selector: 'app-view-bill-modal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './view-bill-modal.component.html',
})

export class ViewBillModalComponent implements OnInit {
  private activeModal = inject(NgbActiveModal);

  newCategoryForm: FormGroup;
  @Input() bill?: Bill;
  viewBill:FormGroup= new FormGroup({
    expenditureId: new FormControl(''),
    date: new FormControl(''),
    amount: new FormControl(''),
    description: new FormControl(''),
    supplier: new FormControl(''),
    period: new FormControl(''),
    category: new FormControl(''),
    billType: new FormControl(''),
    status: new FormControl('')

  })

  constructor(){
    this.newCategoryForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('')
    });
  }

  ngOnInit() {
      this.viewBill.patchValue({
        expenditureId: this.bill?.expenditureId,
        date: this.formatDate(this.bill?.date),
        amount: this.bill?.amount,
        description: this.bill?.description,
        supplier: this.bill?.supplier.name,
        period: `${this.bill?.period.month}/${this.bill?.period.year}`,
        category: this.bill?.category.name,
        billType: this.bill?.billType.name,
        status: this.bill?.status
      });
      this.viewBill.disable();
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}

