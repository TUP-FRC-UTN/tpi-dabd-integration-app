import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { QrComponent } from '../../../qr/qr.component';
import { MainContainerComponent, ToastsContainer, ToastService } from 'ngx-dabd-grupo01';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
} from 'ngx-scanner-qrcode';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessService } from '../../../services/access/access.service';
import { VisitorService } from '../../../services/visitors/visitor.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { VisitorTypeAccessDictionary, VisitorTypeDictionary } from '../../../models/authorization/authorize.model';

@Component({
  selector: 'app-access-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    NgxScannerQrcodeModule,
    ToastsContainer,
    MainContainerComponent
  ],
  templateUrl: './access-form.component.html',
})
export class AccessFormComponent implements OnInit {

  accessForm: FormGroup = {} as FormGroup;
  checkButtonDisabled = true;
  modalService = inject(NgbModal);
  private url = inject(ActivatedRoute);
  @ViewChild('scannerModal') scannerModal: any;
  @ViewChild('action') action!: NgxScannerQrcodeComponent;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;
  private toastService = inject(ToastService);
  typeDictionary = VisitorTypeDictionary;



  public qrValue: string | null = null;

  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth,
      },
    },
  };
  plots: any[] = [];


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private accessService: AccessService,
    private router: Router,
    private visitorService: VisitorService
  ) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
          this.toastService.clear(); // Limpiar los toasts al cambiar de pantalla
      }
  });
  }

  openScanner() {
    this.modalService.open(this.scannerModal, { size: 'xl' });
  }

  ngOnInit(): void {
    this.accessForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      authId: [0, Validators.required],
      docNumber: [null, [Validators.required, Validators.min(0)]],
      action: ['ENTRY', Validators.required], // Nueva acción (ENTRY/SALIDA)
      vehicleType: ['CAR', Validators.required], // Tipo de vehículo (CAR/MOTORBIKE/etc.)
      vehicleReg: [''], // Matrícula del vehículo
      vehicleDescription: [''], // Descripción detallada del vehículo
      comments: [''], // Comentarios adicionales
    });
    this.accessForm.get('lastName')?.disable();
    this.accessForm.get('firstName')?.disable();

    this.accessForm.get('action')?.valueChanges.subscribe((actionValue) => {
      if (actionValue === 'EXIT') {
        //set value of authId to 0
        this.accessForm.get('authId')?.patchValue(null);
        this.accessForm.get('authId')?.disable();
      } else {
        this.accessForm.get('authId')?.patchValue(null);
        this.accessForm.get('authId')?.enable();
      }
    });


    const lote = this.url.snapshot.queryParamMap.get('lote');
    const docNumber = this.url.snapshot.queryParamMap.get('docNumber');

    if (lote && docNumber) {
      this.accessForm.get('docNumber')?.patchValue(docNumber);
      this.autocompleteFields(Number(docNumber), lote);
    }
  }

  ngAfterViewInit(): void {
    this.action.isReady.subscribe((res: any) => {
      this.handle(this.action, 'start');
    });
  }

  onSubmit() {
    if (this.accessForm.valid) {
      let formData = this.accessForm.value;
      let plate = this.accessForm.get('vehicleReg')?.value;
      console.log(formData)


      if (plate != null) {

        this.visitorService.checkAccess(plate, this.accessForm.get('action')?.value).subscribe((data) => {
            if (!data) {
              let text =
                this.accessForm.get('action')?.value == 'ENTRY'
                  ? 'Entrada'
                  : 'Salida';

              Swal.fire({
                title: text + ' inconsistente',
                text:
                  'El ultimo movimiento registrado por '+ this.accessForm.get('firstName')?.value +' '+ this.accessForm.get('lastName')?.value
                 +'  fue una ' +
                  text.toLowerCase() +
                  ' está seguro de querer registrar otra ' +
                  text.toLowerCase() +
                  '?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Cancelar',
                cancelButtonText: 'Continuar',
                customClass: {
                  confirmButton: 'btn btn-danger',
                  cancelButton: 'btn btn-primary',
                },
              }).then((result) => {
                if (result.isDismissed) {

                  this.accessService.createAccess(formData).subscribe((data) => {
                      this.toastService.sendSuccess('Registro exitoso!');
                      this.ngOnInit();
                    });
                }
              });
            } else {

              this.accessService.createAccess(formData).subscribe({
                  next: (data) => {
                    console.log(data)
                    this.toastService.sendSuccess('Registro exitoso!');

                    if(data.is_Late){
                      this.toastService.sendSuccess('Se ha notificado la salida tardía');
                    }
                    this.ngOnInit();
                  },
                  error : (err)=>{

                    if(err.error.status >= 400  || err.error.status <= 409){
                      this.toastService.sendError(err.error.message);

                    }
                  }
                })

            }
          });
      }
    } else {
      this.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/entries/access-query']);
  }

  onDocNumberChange(event: any) {
    let document = this.accessForm.get('docNumber')?.value;
    if (document != null) {
      this.checkButtonDisabled = false;
    } else {
      this.checkButtonDisabled = true;
      return;
    }
    this.visitorService.getVisitor(document).subscribe((data) => {
      switch (data.body) {
        case null:
          this.accessForm.get('lastName')?.setValue('');
          this.accessForm.get('firstName')?.setValue('');
          this.accessForm.get('docNumber')?.setErrors({ unauthorized: true });
          break;
        default:
          this.accessForm.get('lastName')?.setValue(data.body.lastName);
          this.accessForm.get('firstName')?.setValue(data.body.name);
          this.accessForm.get('docNumber')?.setErrors(null);
          this.authService.getValidAuths(document).subscribe((data) => {
            this.plots = [];

            data.forEach((auth) => {
              this.accessService.getOwnerInfo(auth.plotId!).subscribe((data) => {
                console.log(data)
                auth.ownerName = data.owner.first_name;
                auth.ownerLastName = data.owner.last_name;
              })
              this.plots.push(auth);
            });
          });
      }
    });
    this.autocompleteFields(document);
  }

  private markAllAsTouched(): void {
    Object.values(this.accessForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  isAuthorized() {
    let document = this.accessForm.get('docNumber')?.value;
    if (this.accessForm.get('docNumber')?.hasError('unauthorized')) {
      this.toastService.sendError(
        'No registrado, consulte al propietario si autoriza su entrada.'
      );
      return;
    }
    this.authService.getValid(document).subscribe((data) => {
      if (data) {
        this.toastService.sendSuccess(
          'Autorizado, tiene permiso para el ingreso.'
        );
      } else {
        this.toastService.sendError(
          'No registrado, consulte al propietario si autoriza su entrada.'
        );
      }
    });
  }

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    e && action && action.pause();
    if (e[0].value != null) {
      this.qrValue = e[0].value;
      this.modalService.dismissAll();
      console.log(e[0].value);
      console.log(Number(this.getDocumentNumberFromString(e[0].value)));
      this.accessForm
        .get('docNumber')
        ?.patchValue(Number(this.getDocumentNumberFromString(e[0].value)));
      this.autocompleteFields(
        Number(this.getDocumentNumberFromString(e[0].value))
      );
    }
  }

  public handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      const device = devices.find((f) =>
        /back|rear|environment/gi.test(f.label)
      );
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    };

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe(
        (r: any) => console.log(fn, r),
        alert
      );
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }

  autocompleteFields(document: number, lote?: string) {
    if (document != null) {
      this.checkButtonDisabled = false;
    } else {
      this.checkButtonDisabled = true;
      return;
    }
    this.visitorService.getVisitor(document).subscribe((data) => {
      switch (data.body) {
        case null:
          this.accessForm.get('lastName')?.setValue('');
          this.accessForm.get('firstName')?.setValue('');
          this.accessForm.get('docNumber')?.setErrors({ unauthorized: true });
          break;
        default:
          this.accessForm.get('lastName')?.setValue(data.body.lastName);
          this.accessForm.get('firstName')?.setValue(data.body.name);
          this.accessForm.get('docNumber')?.setErrors(null);
          this.authService.getValidAuths(document).subscribe((data) => {
            this.plots = [];
            data.forEach((auth) => {
              this.accessService.getOwnerInfo(auth.plotId!).subscribe((data) => {
                console.log(data)
                auth.ownerName = data.owner.first_name;
                auth.ownerLastName = data.owner.last_name;
              })
              this.plots.push(auth);
            });
          });

      }
    });
  }

  getDocumentNumberFromString(inputString: string) {
    const regex = /Document:\s*(\d+)/;
    const match = inputString.match(regex);

    return match ? match[1] : null;
  }


  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
  }
}
