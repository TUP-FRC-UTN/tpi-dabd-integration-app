import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
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
  // loadSelect() {
  //   this.periodService.get().subscribe((data=>{
  //     data.forEach((period) => {
  //       if(period.state != 'CLOSE'){
  //         this.listPeriodo.push(period);
  //       }
  //     });
  //   }))
  //   this.lotsService.get().subscribe((data: Lot[]) => {
  //     this.lots = data;
  //   })
  //   this.chargeService.getCategoriesExcFines().subscribe((data: CategoryCharge[]) => {
  //     this.categoriaCargos = data;
  //   })
  // }
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

    this.chargeService.getCategoryCharges().subscribe((data: CategoryCharge[]) => {
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
      amount: ['', Validators.required],
      categoryId: ['', Validators.required],
      description:['']
    });
  }

  ngOnInit(): void {
    this.loadSelect();
  }

  onBack() {
    this.router.navigate([`cargos`]);
  }

  onSubmit(): void {
    console.log(this.chargeForm.value)
    console.log(this.chargeForm.valid)

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
      console.log(charge);
      const charges = this.camelToSnake(charge) as Charge;

      this.chargeService.addCharge(charges).subscribe(
        (response) => {
          this.toastService.sendSuccess("El cargo se ha registrado correctamente");

          console.log('Cargo registrado exitosamente:', response);
          //('Cargo registrado exitosamente');
          this.chargeForm.reset();
          this.router.navigate([`cargos`]);
        },
        (error) => {
          this.toastService.sendError("Error al registrar el cargo");
          console.error('Error al registrar el cargo:', error);
        }
      );
    }
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

}
