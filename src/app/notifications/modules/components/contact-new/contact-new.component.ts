import { Component, Inject,inject } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactModel } from '../../../models/contacts/contactModel';
import { ContactService } from '../../../services/contact.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { Observable } from 'rxjs';
import {  } from '@angular/forms';
import { ContactType } from '../../../models/contacts/contactAudit';



@Component({
  selector: 'app-contact-new',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MainContainerComponent],
  templateUrl: './contact-new.component.html',
  styleUrl: './contact-new.component.css'
})

@Inject('ContactService')
export class ContactNewComponent {


  selectedContactType: string = '';
  email: string = '';
  phone: string = '';
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  contactService = new ContactService();
  toastService : ToastService = inject(ToastService)

  /*existeUsuario(control: FormControl): Observable<any> { 
    const username = control.value; return this.http.get(`url_para_verificar_username/${username}`);
  }*/


    newContactForm: FormGroup = new FormGroup({
      contactType: new FormControl('', [Validators.required]),
      contactValue: new FormControl('', [Validators.required]),
    //  phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),        //[this.uniqueEmail()]      
    });

    /*formulario: FormGroup;
    constructor(private formBuilder: FormBuilder) {
      this.formulario = this.formBuilder.group({
        contactType: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      });
    }*/
    
  onContactTypeChange() {
    this.email = '';
    this.phone = '';
  }

  resetForm() {
    this.newContactForm.reset();
    this.selectedContactType = '';
    this.email = '';
    this.phone = '';
  }

  sendForm() {
    if (this.newContactForm.valid) {

      const contact: ContactModel = {
        id: 1,
        subscriptions: [
          'General',
          'Moderación',
          'Construcción',
          'Pago a empleados',
          'Vencimiento de gastos',
          'Deuda',
          'Factura general',
          'Pago',
          'Usuario',
          'Usuario asociado creado',
          'Salida tardía del trabajador',
          'Inventario',
          'Gasto general'],
        contactValue: this.newContactForm.get('contactValue')?.value,
        contactType: this.newContactForm.get('contactType')?.value,
        active: true,
        showSubscriptions: false
      };

      this.contactService.saveContact(contact).subscribe({
        next: (response) => {

          this.toastService.sendSuccess('El contacto ha sido registrado correctamente');
          console.log(contact);


          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {

          this.toastService.sendError('Error al crear contacto porfavor intente nuevamente ')
          console.error('Error al crear contacto intentar nuevamente:', error);
          console.log(contact);
        },
      });


    }


  }

  showModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
