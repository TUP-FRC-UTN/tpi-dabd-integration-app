import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { Address, Contact } from '../../../models/owner';
import { SessionService } from '../../../services/session.service';
import { User } from '../../../models/user';
import { Country, Provinces } from '../../../models/generics';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoComponent } from '../../commons/info/info.component';
import { ChangePasswordComponent } from '../../change-password/change-password.component';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [ReactiveFormsModule, MainContainerComponent, NgClass],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css'
})
export class ProfileDetailComponent {
  private userService = inject(UserService);
  private toastService = inject(ToastService)
  private sessionService = inject(SessionService)
  private router = inject(Router)
  private modalService = inject(NgbModal);

  id!: number;
  user: any = {};
  address!: Address;
  addresses: Address[] = [];
  addressIndex: number | undefined = undefined;
  contact!: Contact;
  contacts: Contact[] = [];
  contactIndex: number | undefined = undefined;
  provinceOptions!: any;
  countryOptions!: any;

  //#region FORMULARIO REACTIVO
  userForm = new FormGroup({
    email: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    userName: new FormControl(''),

    contactsForm: new FormGroup({
      contactType: new FormControl('', []),
      contactValue: new FormControl('', []),
    }),
    addressForm: new FormGroup({
      streetAddress: new FormControl(''),
      number: new FormControl(0),
      floor: new FormControl(0),
      apartment: new FormControl(''),
      city: new FormControl(''),
      province: new FormControl(''),
      country: new FormControl(''),
      postalCode: new FormControl(''),
    })
  });


  setEditValues() {
    this.userForm.disable()
    if (this.id) {
      this.userService.getUserById(Number(this.id)).subscribe(
        response => {
          console.log(response)
          this.user = response;

          this.userForm.patchValue({
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            userName: this.user.userName,
          });



          if (this.user.addresses) {
            this.addresses = [...this.user.addresses];
            if (this.addresses.length > 0) {
              this.setAddressValue(0);
            }
          }

          if (this.user.contacts) {
            this.contacts = [...this.user.contacts];
            if (this.contacts.length > 0) {
              this.setContactValue(0);
            }
          }

        },
        error => {
          this.toastService.sendError('Error al obtener el usuario.')
        }
      );
    }
  }

  setAddressValue(index: number) {
    const address = this.addresses[index];

    if (address) {
      const addressFormGroup = this.userForm.get('addressForm') as FormGroup;

      addressFormGroup.patchValue({
        streetAddress: address.streetAddress,
        number: address.number,
        floor: address.floor,
        apartment: address.apartment,
        city: address.city,
        province: address.province,
        country: address.country,
        postalCode: address.postalCode
      });
      this.addressIndex = index;
    }
  }
  setContactValue(index: number) {
    const contact = this.contacts[index];
    console.log(contact)
    if (contact) {
      const contactFormGroup = this.userForm.get('contactsForm') as FormGroup;

      contactFormGroup.patchValue({
        contactType: contact.contactType,
        contactValue: contact.contactValue,
      })

      this.contactIndex = index;
    }
  }
  //#endregion
  onSubmit(): void {
    this.router.navigate(["/users/profile/edit"])
  }

  setEnums() {
    this.provinceOptions = Object.entries(Provinces).map(([key, value]) => ({
      value: key,
      display: value
    }));
    this.countryOptions = Object.entries(Country).map(([key, value]) => ({
      value: key,
      display: value
    }));
  }

  navigateToPassword() {
    this.router.navigate(["users/changepassword"])

  }
  
  ngOnInit(): void {

    this.id = this.getUserId()
    this.setEnums()

    if (this.id !== null) {
      this.setEditValues();
    }
  }
  getUserId() {
    let user: User = this.sessionService.getItem('user')

    return user.id!!
  }

  openChangePasswordModal(){
    const modalRef = this.modalService.open(ChangePasswordComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: false
    });
  }

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.title = 'Información del perfil del usuario';
    modalRef.componentInstance.description = 'Esta pantalla muestra la información personal cargada por el usuario.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Email:',
            detail: 'Email del usuario.'
          },
          {
            strong: 'Nombre:',
            detail: 'Nombre del usuario.'
          },
          {
            strong: 'Nombre de Usuario:',
            detail: 'Nombre de usuario del usuario.'
          },
          {
            strong: 'Apellido:',
            detail: 'Apellido del usuario.'
          },
        ]
      },
      {
        title: 'Dirección',
        content: [
          {
            strong: 'Calle:',
            detail: 'Muestra el nombre de la calle.'
          },
          {
            strong: 'Número:',
            detail: 'Muestra el número de calle de la dirección.'
          },
          {
            strong: 'Piso:',
            detail: 'Muestra el piso, con valor predeterminado 0.'
          },
          {
            strong: 'Depto:',
            detail: 'Muestra el número de departamento.'
          },
          {
            strong: 'País:',
            detail: 'Muestra el país.'
          },
          {
            strong: 'Provincia:',
            detail: 'Muestra la provincia.'
          },
          {
            strong: 'Ciudad:',
            detail: 'Muestra la ciudad.'
          },
          {
            strong: 'Código Postal:',
            detail: 'Muestra el código postal.'
          }
        ]
      },
      {
        title: 'Contactos',
        content: [
          {
            strong: 'Tipo Contacto:',
            detail: 'Muestra el tipo de contacto.'
          },
          {
            strong: 'Contacto:',
            detail: 'Muestra el valor del contacto.'
          }
        ]
      },
      {
        title: 'Funcionalidades de los botones',
        content: [
          {
            strong: 'Cambiar contraseña:',
            detail: 'Botón azul que lleva a la pantalla para cambiar la contaseña.'
          },
          {
            strong: 'Editar:',
            detail: 'Botón azul que lleva a la pantalla para editar la información del perfil.'
          },
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los procesos de validación de usuarios.'
    ];
  }


}
