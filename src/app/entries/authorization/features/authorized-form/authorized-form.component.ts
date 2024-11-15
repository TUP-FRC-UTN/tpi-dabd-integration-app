import {Component, inject, OnInit,} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormArray} from '@angular/forms';
import {CommonModule, NgClass} from '@angular/common';
import {AuthService} from "../../../services/authorized-range/auth.service";
import {LoginService} from "../../../services/access/login.service";
import {NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {UserTypeService} from "../../../services/user-type.service";
import {RangeModalComponent} from "../authorized-range-form/authorized-range-form.component";
import {NgSelectComponent} from "@ng-select/ng-select";
import { ToastsContainer, ToastService, MainContainerComponent} from "ngx-dabd-grupo01";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    NgSelectComponent,
    ToastsContainer,
    MainContainerComponent
  ],
  templateUrl: './authorized-form.component.html'
})
export class AuthFormComponent implements OnInit {
  authForm: FormGroup = {} as FormGroup;
  plots: plot[] = []
  plot: any = null
  isUpdate = false
  paramRoutes = inject(ActivatedRoute);
  modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  userType: string = "ADMIN"

  constructor(private fb: FormBuilder, private authService: AuthService, private loginService: LoginService, private router: Router, private userTypeService: UserTypeService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.authForm = this.createForm();


    this.userType = this.userTypeService.getType()
    if (this.userType == "OWNER"){
      this.authForm.get('plotId')?.setValue(2)
      this.authForm.get('plotId')?.disable()
      this.authForm.get('visitorType')?.setValue("VISITOR")
      this.authForm.get('visitorType')?.disable()
    }
    if (this.userType == "ADMIN") {
      this.authForm.get('plotId')?.enable()
      this.authForm.get('visitorType')?.enable()
    }
    if  (this.userType == "GUARD") {
      this.authForm.get('visitorType')?.setValue("VISITOR")
      this.authForm.get('visitorType')?.disable()
      this.authForm.get('plotId')?.enable()
    }
    this.userTypeService.userType$.subscribe((userType: string) => {
      this.userType = userType
      if (this.userType == "OWNER"){
        this.authForm.get('plotId')?.setValue(2)
        this.authForm.get('plotId')?.disable()
        this.authForm.get('visitorType')?.setValue("VISITOR")
        this.authForm.get('visitorType')?.disable()
      }
      if (this.userType == "ADMIN") {
        this.authForm.get('plotId')?.enable()
        this.authForm.get('visitorType')?.enable()
      }
      if  (this.userType == "GUARD") {
        this.authForm.get('visitorType')?.setValue("VISITOR")
        this.authForm.get('visitorType')?.disable()
        this.authForm.get('plotId')?.enable()
      }

      const documentParam = this.paramRoutes.snapshot.queryParamMap.get('docNumber');
     console.log(documentParam)

      if (documentParam) {
      this.authForm.get('visitorRequest.docNumber')?.patchValue(documentParam);
    }

    });

    const documentParam = this.paramRoutes.snapshot.queryParamMap.get('authId');
    if (documentParam) {
      this.isUpdate = true
      this.authService.getById(parseInt(documentParam, 10)).subscribe(datas => {
        let data = datas[0]
        // Completa el formulario

        this.authForm.patchValue({
          authId: data.authId,
          isActive:data.isActive,
          visitorType: data.visitorType,
          plotId: data.plotId,
          visitorRequest: {
            name: data.visitor.name,
            lastName: data.visitor.lastName,
            docType: data.visitor.docType,
            docNumber: data.visitor.docNumber,

            birthDate: data.visitor.birthDate ? this.formatDate(data.visitor.birthDate) : null, // Asegúrate de formatear la fecha si es necesario
          }
        });

        // Completar authRangeRequest
        const authRanges = data.authRanges.map(range => ({
          authRangeId: range.authRangeId,
          dateFrom: this.formatDate(range.dateFrom),
          dateTo: this.formatDate(range.dateTo),
          hourFrom: range.hourFrom,
          hourTo: range.hourTo,
          daysOfWeek: range.daysOfWeek,
          comment: range.comment,
          isActive: range.isActive
        }));

        this.authForm.patchValue({authRangeRequest: authRanges});
      });
      if (this.isUpdate){

        this.authForm.get('visitorType')?.disable()
        this.authForm.get('visitorRequest.name')?.disable()
        this.authForm.get('visitorRequest.lastName')?.disable()
        this.authForm.get('visitorRequest.docNumber')?.disable()
        this.authForm.get('visitorRequest.docType')?.disable()
        this.authForm.get('visitorRequest.birthDate')?.disable()
      }
    }
  }

  formatDate(dateString: string) {
    const parts = dateString.split('-'); // Divide la cadena en partes
    // Asegúrate de que el formato sea correcto (DD-MM-YYYY)
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // Retorna YYYY-MM-DD
    }
    return dateString;
  }

  createForm(): FormGroup {
    return this.fb.group({
      authId: 0,
      isActive:true,
      visitorType: ['VISITOR', Validators.required],
      plotId: [null, Validators.required],
      visitorRequest: this.fb.group({
        name: ['', Validators.required],
        lastName: ['', Validators.required],
        docType: ['DNI', Validators.required],
        docNumber: [null, Validators.required],
        birthDate: [null],
      }),
      authRangeRequest: [[]]
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      if(this.authForm.value.visitorType == undefined){
        this.authForm.value.visitorType = "VISITOR"
      }
      if(this.authForm.value.plotId == undefined){
        this.authForm.value.plotId = 2
      }
      const formData = this.authForm.value;

      const now = new Date();

      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = '00';
        return `${hours}:${minutes}:${seconds}`;
      };

      const dateFrom = formatDate(now);
      const dateTo = new Date(now.getTime() + 15 * 60000);
      const isNewDay = dateTo.getDate() !== now.getDate();
      const finalDateFrom = isNewDay ? formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)) : dateFrom;

      if (formData.authRangeRequest.length === 0) {
        const authRange = {
          dateFrom: finalDateFrom,
          dateTo: formatDate(dateTo),
          hourFrom: isNewDay ? "00:00:00" : formatTime(now),
          hourTo: formatTime(dateTo),
          daysOfWeek: [this.getDayOfWeek(now)],
          comment: "Access for John Doe"
        };

        formData.authRangeRequest = [authRange];
      } else{
        for (let range of formData.authRangeRequest) {
          range.dateFrom = formatDate(new Date(range.dateFrom));
          range.dateTo = formatDate(new Date(range.dateTo));

          if(range.hourFrom.length< 8){
            range.hourFrom = range.hourFrom + ':00';
          }
          if(range.hourTo.length< 8){
            range.hourTo = range.hourTo + ':00';
          }
        }
      }

      if (!this.isUpdate) {
        if(formData.visitorRequest.birthDate){
          formData.visitorRequest.birthDate = formatFormDate(formData.visitorRequest.birthDate);
        }
        this.authService.createAuth(formData, this.loginService.getLogin().id.toString()).subscribe(data => {
          this.toastService.sendSuccess("Registro exitoso.");

        });
      }
      else {
        this.authService.updateAuth(formData, this.loginService.getLogin().id.toString()).subscribe(data => {
          this.toastService.sendSuccess("Autorización exitosa.");

        });
      }
      setTimeout(() => {
        this.toastService.remove(this.toastService.toasts[0]);  // Cierra el modal
        this.isUpdate = false;
      }, 1500);
    } else {
      this.markAllAsTouched();
    }

    this.router.navigate(['/entries/auth-list']);

  }

  getDayOfWeek(date: Date): string {
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return days[date.getDay()];
  }

  openModal() {
    const modalRef = this.modalService.open(RangeModalComponent, {size: 'xl'});
    console.log('range request ' + this.authForm.get('authRangeRequest')?.value)
    console.log('value ' + this.authForm.controls['visitorType'].value)
    
    modalRef.componentInstance.ranges = this.authForm.get('authRangeRequest')?.value
    modalRef.componentInstance.visitorType = this.authForm.controls['visitorType'].value

    modalRef.result.then((result) => {
      if (result != undefined){

      this.authForm.get('authRangeRequest')?.setValue(result)
      }
    }).catch((error) => {
      console.log(this.authForm.get('authRangeRequest')?.value)
      console.error('Modal cerrado sin guardar cambios', error);
    });
  }

  onCancel() {
    this.router.navigate(['/entries/auth-list']);
  }

  onPlotSelected(selectedPlot: plot) {
    this.plot = this.plots.find((plot) => plot.id === selectedPlot.id) || null;
  }

  private markAllAsTouched(): void {
    // Marca todos los controles en el formulario principal
    Object.values(this.authForm.controls).forEach(control => {
      control.markAsTouched();
      // Si es un FormGroup, recorre sus controles
      if (control instanceof FormGroup) {
        this.markAllAsTouchedRecursive(control);
      }
      // Si es un FormArray, recorre sus controles
      if (control instanceof FormArray) {
        control.controls.forEach(innerControl => {
          innerControl.markAsTouched();
        });
      }
    });
  }

  setPlot(id: number) {
    this.plot = this.plots.filter(x => x.id == id)[0]
  }

// Función recursiva para marcar todos los controles como tocados
  private markAllAsTouchedRecursive(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouchedRecursive(control); // Llamada recursiva
      }
      if (control instanceof FormArray) {
        control.controls.forEach(innerControl => {
          innerControl.markAsTouched();
        });
      }
    });
  }


}

function formatFormDate(inputDate: string): string {
  // Verificar que la entrada sea una fecha válida en el formato yyyy-MM-dd
  const dateParts = inputDate.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Fecha no válida. Debe estar en formato yyyy-MM-dd');
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  // Devolver la fecha en el formato dd-MM-yyyy
  return `${day}-${month}-${year}`;
}

export interface plot {
  id: number,
  desc: string,
  tel: string,
  name: string
}
