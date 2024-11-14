import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ChargeService } from '../../../services/charge.service';
import { CategoryCharge, Charge, ChargeType, Periods } from '../../../models/charge';
import { PeriodSelectComponent } from '../../selects/period-select/period-select.component';
import Lot from '../../../models/lot';
import { PeriodService } from '../../../services/period.service';
import { LotsService } from '../../../services/lots.service';
import { CommonModule } from '@angular/common';
import { NgModalComponent } from '../../modals/ng-modal/ng-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { ChargeInfoComponent } from '../../modals/info/charge-info/charge-info.component';
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';
import { map } from 'rxjs';
import { NewCategoryChargeModalComponent } from '../../modals/charges/category/new-categoryCharge-modal/new-categoryCharge-modal.component';
import { StorageService } from '../../../services/storage.service';
import { User } from '../../../models/user';
@Component({
  selector: 'app-expenses-add-charge',
  standalone: true,
  imports: [ReactiveFormsModule, PeriodSelectComponent,CommonModule,NgModalComponent, MainContainerComponent, NgSelectComponent,
    NgOptionComponent],
  templateUrl: './expenses-add-charge.component.html',
  styleUrl: './expenses-add-charge.component.css',
})
export class ExpensesAddChargeComponent implements OnInit{
  // chargeForm: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  private chargeService = inject(ChargeService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private storage = inject(StorageService);
  toastService:ToastService = inject(ToastService)
  lots : Lot[] = []


  private readonly periodService = inject(PeriodService)
  private readonly lotsService = inject(LotsService)
  listPeriodo:Periods[] =[];
  categoriaCargos: CategoryCharge[] = [];

  selectedPeriodId: number | null = null;
  selectedLotId : number = 0;


  onCancel() {
    this.chargeForm.reset();
    this.router.navigate([`expenses/cargos`])
  }

  showInfo(){
    this.modalService.open(ChargeInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });
  }
  formattedPeriods: any[] = [];

  loadSelect() {
    this.periodService.get().pipe(
      map((periods) =>
        periods
          .filter((period) => period.state !== 'CLOSE')
          .map((period) => ({
            ...period,
            displayPeriod: `${period.month}/${period.year}`
          }))
      )
    ).subscribe((formattedPeriods) => {
      this.formattedPeriods = formattedPeriods;
    });

    this.lotsService.get().subscribe((data: Lot[]) => {
      this.lots = data;
    });

    this.chargeService.getCategoriesExcFines().subscribe((data: CategoryCharge[]) => {
      this.categoriaCargos = data;
    });
  }

  comparePeriodFn(period1: any, period2: any) {
    return period1 && period2 ? period1.id === period2.id : period1 === period2;
  }

  chargeForm: FormGroup;

  constructor() {
    this.chargeForm = this.fb.group({
      lotId: ['', Validators.required],
      date: ['', Validators.required],
      periodId: ['', Validators.required],
      amount: ['', [Validators.required,this.amountValidator]],
      categoryChargeId: ['', Validators.required],
      description:['']
    });
  }


  amountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const amount = control.value;
      const categoryChargeId = this.chargeForm.get('categoryChargeId')?.value;
      if (categoryChargeId === null) return null;

      const categoryCharge = this.categoriaCargos.find(c => c.categoryChargeId === categoryChargeId);
      const tipo = categoryCharge?.amountSign;

      if (tipo === ChargeType.ABSOLUTE) {
        // Error si el monto no es positivo
        return amount > 0 ? null : { positiveOnly: true };
      } else if (tipo === ChargeType.NEGATIVE) {
        // Error si el monto no es negativo
        return amount < 0 ? null : { negativeOnly: true };
      } else if (tipo === ChargeType.PERCENTAGE) {
        // Error si el monto no está entre 0 y 100 con hasta dos decimales
        const isPercentage = amount >= 0 && amount <= 100 && /^\d+(\.\d{1,2})?$/.test(amount);
        return isPercentage ? null : { percentageOnly: true };
      }

      return null;
    };
  }

  ngOnInit(): void {
    this.storage.saveToStorage(this.userLoggin,'user');
    this.loadSelect();
    let user = this.storage.getFromSessionStorage('user') as User;
  }

  onBack() {
    this.router.navigate([`expenses/cargos`]);
  }

  onSubmit(): void {

    if (this.chargeForm.valid) {
      const formValue = this.chargeForm.value;
      const charge: Charge = {
        ...formValue,
        date: new Date(formValue.date).toISOString(),
      };
      if(this.chargeForm.get('categoryChargeId')?.value !=6){
        charge.amountSign = ChargeType.ABSOLUTE;
      } else{
        charge.amountSign = ChargeType.NEGATIVE;
      }
      const charges = this.camelToSnake(charge) as Charge;

      this.chargeService.addCharge(charges).subscribe(
        (response) => {
          this.toastService.sendSuccess("El cargo se ha registrado correctamente");

          //('Cargo registrado exitosamente');
          this.chargeForm.reset();
          this.router.navigate([`expenses/cargos`]);
        },
        (error) => {
          this.toastService.sendError("Error al registrar el cargo");
          console.error('Error al registrar el cargo:', error);
        }
      );
    }
  }

    // #region Modal
    openNewCategoryModal() {
      const modalRef = this.modalService.open(NewCategoryChargeModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
      });

      modalRef.result.then((result) => {
        if (result) {
          if (result.success) {
            this.toastService.sendSuccess(result.message);
            this.loadSelect();
          } else {
            this.toastService.sendError(result.message);
          }
        }
      });
    }

  camelToSnake(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.camelToSnake(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        // Convierte la clave de camelCase a snake_case
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        // Aplica la conversión recursiva si el valor es un objeto o array
        acc[snakeKey] = this.camelToSnake(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }



  userLoggin = {
    "value": {
      "id": 1,
      "first_name": "Super",
      "last_name": "Admin",
      "user_name": "superadmin",
      "email": "superadmin@example.com",
      "is_active": true,
      "owner_id": 1,
      "plot_id": 1,
      "addresses": null,
      "contacts": null,
      "roles": [
        {
          "id": 1,
          "code": 999,
          "name": "SUPERADMIN",
          "description": "Nivel más alto de acceso",
          "pretty_name": "Superadministrador",
          "is_active": true
        }
      ],
      "created_date": "12/11/2024 09:53 p. m.",
      "document_number": "12345678",
      "document_type": "DNI",
      "birthdate": "01/01/1990"
    },
    "expirationTime": 1731545612929
  };

}
