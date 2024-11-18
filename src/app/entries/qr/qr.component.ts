import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Component, inject, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ConfirmAlertComponent , ToastsContainer, ToastService } from 'ngx-dabd-grupo01';
import { QrService, sendQRByEmailRequest } from '../services/qr/qr.service';
import { SessionService } from '../../users/services/session.service';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [FormsModule, CommonModule , ReactiveFormsModule , ConfirmAlertComponent , ToastsContainer],
  templateUrl: './qr.component.html',
})
export class QrComponent implements OnInit{

  toastService = inject(ToastService);

  form: FormGroup = new FormGroup({
    email: new FormControl('' , [Validators.required, Validators.email]),
  });

sessionService = inject(SessionService);

showAlert: boolean = false;


sendQRByEmail() {

  if(this.form.valid){

    const user = this.sessionService.getItem('user');

    const request: sendQRByEmailRequest = {
      email: this.form.value.email,
      invitor_name: user.first_name +' '+ user.last_name,
      doc_number: this.docNumber
    }

    console.log(request)
    this.qrService.sendQRByEmail(request , 1).subscribe({
      next:(data)=>{
        console.log(data)
        this.toastService.sendSuccess("El QR ha sido enviado con exito")
       
      },
      error:(error)=>{
        console.log(error)
       this.toastService.sendError("Fallo al enviar QR, intente nuevamente...")
      }
    })
  }
}


  @Input() docNumber: number = 0;
  qrImageSrc: string = '';
 showEmailForm: boolean = false;

  constructor(private qrService: QrService) {}

  generateQr() {
    this.qrService.getQr(this.docNumber).subscribe((response) => {
      const reader = new FileReader();
      reader.readAsDataURL(response);
      reader.onloadend = () => {
        this.qrImageSrc = reader.result as string;
      };
    });
  }

  ngOnInit(): void {
    this.generateQr()
  }

  handleConfirm() {
    this.showAlert = false; // Ocultar la alerta después de confirmar
  }
}
