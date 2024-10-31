import { Component, Inject,inject } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactModel } from '../../../models/contacts/contactModel';
import { ContactService } from '../../../services/contact.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';


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

  onContactTypeChange() {
    this.email = '';
    this.phone = '';
  }

  resetForm(form: NgForm) {
    form.resetForm();
    this.selectedContactType = '';
    this.email = '';
    this.phone = '';
  }

  sendForm(form: NgForm) {

    if (form.valid) {

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
        contactValue: this.selectedContactType === 'EMAIL' ? this.email : this.phone,
        contactType: this.selectedContactType,
        active: true,
        showSubscriptions: false
      };

      this.contactService.saveContact(contact).subscribe({
        next: (response:any) => {

          this.toastService.sendSuccess('El contacto ha sido registrado correctamente');

          this.resetForm(form);
        },
        error: (error: HttpErrorResponse) => {

          this.toastService.sendError('Error al crear contacto porfavor intente nuevamente ')
          console.error('Error al crear contacto intentar nuevamente:', error);
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
