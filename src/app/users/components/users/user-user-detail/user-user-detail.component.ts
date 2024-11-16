import { Location, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { RoleService } from '../../../services/role.service';
import { PlotService } from '../../../services/plot.service';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { Address, Contact } from '../../../models/owner';
import { Role } from '../../../models/role';
import { Plot } from '../../../models/plot';
import { Country, Provinces } from '../../../models/generics';
import { User } from '../../../models/user';
import { toSnakeCase } from '../../../utils/owner-helper';
import { InfoComponent } from '../../commons/info/info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { birthdateValidation } from '../../../validators/birthdate.validations';
import { plotForUserValidator } from '../../../validators/cadastre-plot-for-users';

@Component({
  selector: 'app-user-user-detail',
  standalone: true,
  imports: [ReactiveFormsModule, MainContainerComponent, NgClass],
  templateUrl: './user-user-detail.component.html',
  styleUrl: './user-user-detail.component.css'
})
export class UserUserDetailComponent {
  //#region SERVICIOS
  private userService = inject(UserService);
  private roleService = inject(RoleService)
  private plotService = inject(PlotService)
  private ownerPlotService = inject(OwnerPlotService)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private toastService = inject(ToastService)
  private location = inject(Location)
  private modalService = inject(NgbModal)
  //#endregion

  //#region ATT
  id: string | null = null;
  user: any = {};
  address!: Address;
  addresses: Address[] = [];
  addressIndex: number | undefined = undefined;
  contact!: Contact;
  contacts: Contact[] = [];
  contactIndex: number | undefined = undefined;
  rol!: Role;
  plot!: Plot;
  roles: any[] = []
  rolesForCombo: Role[] = []
  provinceOptions!: any;
  countryOptions!: any;
  actualPlotOfOwner!: Plot[]
  minDate: any
  //#endregion

  //#region FORMULARIO REACTIVO
  userForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(50)],
    }),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Cambiado
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Cambiado
    userName: new FormControl('', [Validators.required, Validators.maxLength(50)]), // Cambiado
    documentType: new FormControl('', [Validators.required]),
    documentNumber: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    birthdate: new FormControl('', [Validators.required, birthdateValidation]),

    rolesForm: new FormGroup({
      rol: new FormControl('', []),
    }),

    contactsForm: new FormGroup({
      contactType: new FormControl('', []),
      contactValue: new FormControl('', []),
    }),
    addressForm: new FormGroup({
      streetAddress: new FormControl('', [Validators.required]),
      number: new FormControl(0, [Validators.required, Validators.min(0)]),
      floor: new FormControl(0),
      apartment: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      province: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [Validators.required]),
    }),

    plotForm: new FormGroup({
      plotNumber: new FormControl(
        '',
        [Validators.min(1)],
        [plotForUserValidator(this.plotService)]
      ),
      blockNumber: new FormControl('', [
        Validators.min(1),
      ]),
    }),
  });
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.userForm.disable()
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id !== null) {
      this.setEditValues();
    }
    this.setEnums()
    this.getAllRoles()
    this.getPlotsOfOwner();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 7);
    this.minDate = tomorrow.toISOString().split('T')[0];
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

  setContactType(contactType: string | undefined) {
    switch(contactType){
      case "PHONE":
        return "Teléfono";
      case "EMAIL":
        return "Email";
      case "SOCIAL_MEDIA_LINK":
        return "Link red social";
      default:
        return "Otro";
    }
  }

  //#endregion

  //#region SETEAR VALORES AL FORM
  setEditValues() {
    if (this.id) {
      this.userService.getUserById(Number(this.id)).subscribe(
        response => {
          this.user = response;
          let formattedDate: any
          if (this.user.birthdate) {
            const [day, month, year] = this.user.birthdate?.split('/');
            formattedDate = `${year}-${month}-${day}`;
          }
          this.userForm.patchValue({
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            userName: this.user.userName,
            documentType: this.user.documentType,
            documentNumber: this.user.documentNumber,
            birthdate: formattedDate
          });

          if (response.plotId !== undefined) {
            this.setPlotValue(response.plotId);
          }

          if (this.user.addresses) {
            this.addresses = [...this.user.addresses];
          }

          if (this.user.contacts) {
            this.contacts = [...this.user.contacts];
          }
          console.log(this.user.roles)
          if (this.user.roles) {
            this.roles = [...this.user.roles];
          }
        },
        error => {
          this.toastService.sendError('Error al obtener el usuario')
        }
      );
    }
  }
  //#endregion

  //#region RUTEO | CANCELAR
  cancel() {
    this.router.navigate(["/users/user/list"])

  }
  //#endregion

  //#region FUNCION CONTACTO
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

  getContactsValues(): Contact {
    const contactFormGroup = this.userForm.get('contactsForm') as FormGroup;
    return {
      contactType: contactFormGroup.get('contactType')?.value || '',
      contactValue: contactFormGroup.get('contactValue')?.value || '',
    };
  }

  cancelEditContact() {
    this.userForm.get('contactsForm')?.reset();
    this.contactIndex = undefined;
  }

  //#endregion

  //#region FUNCION ROLES
  getRolValue() {
    const rolFormGroup = this.userForm.get('rolesForm') as FormGroup;
    return {
      rol: rolFormGroup.get('rol')?.value || '',
    };
  }

  getAllRoles() {
    this.roleService.getAllRoles(0, 1000000, true).subscribe(
      response => this.rolesForCombo = response.content
    )
  }

  transformRoles(user: User): number[] | undefined {
    return user.roles?.map(role => role.id);
  }


  //#endregion

  //#region CREATE / UPDATE
  fillUser() {
    this.user.id = this.id ? parseInt(this.id) : undefined;
    (this.user.firstName = this.userForm.get('firstName')?.value || ''),
      (this.user.lastName = this.userForm.get('lastName')?.value || ''),
      (this.user.userName = this.userForm.get('userName')?.value || ''),
      (this.user.email = this.userForm.get('email')?.value || ''),
      (this.user.isActive = this.userForm.get('isActive')?.value || undefined),
      (this.user.contacts = [...this.contacts]),
      (this.user.addresses = [...this.addresses]);
    (this.user.roles = [...this.roles]),
      (this.user.plotId = this.userForm.get('plotForm.plotAssign')?.value || undefined)
  }

  createUser() {
    this.fillUser();
    this.user.isActive = true;
    this.user = toSnakeCase(this.user);
    this.user.roles = this.transformRoles(this.user)
    this.userService.addUser(this.user).subscribe({
      // '1' is x-user-id
      next: (response) => {
        this.toastService.sendSuccess("Usuario creado con éxito")
        this.router.navigate(['users/user/list']);
      },
      error: (error) => {
        console.error('Error creating owner:', error);
      },
    });
  }

  updateUser() {
    this.fillUser();
    if (this.user.id) {
      this.userService.updateUser(this.user.id, this.user).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("Usuario actualizado con éxito")
          this.router.navigate(['users/owner/list']);
        },
        error: (error) => {
          this.toastService.sendError("Error actualizado el usuario")
        },
      });
    } else {
      this.toastService.sendError("Algo salió mal")
    }
  }
  //#endregion

  //#region FUNCION PLOTS

  getPlotsOfOwner() {
    // TODO: Ver como obtener el ownerId
    if (this.user.plotId) {
      this.plotService.getPlotById(this.user.plotId).subscribe(
        response => {
          this.actualPlotOfOwner = [response];
        },
        error => {
          this.toastService.sendError("Error recuperando los datos del usuario. Reinicie la página")
        }
      )
    }
  }

  setPlotValue(plotId: number) {
    const plotFormGroup = this.userForm.get('plotForm') as FormGroup;
    this.plotService.getPlotById(plotId).subscribe(
      response => {
        console.log(response);
        plotFormGroup.patchValue({
          plotNumber: response.plotNumber,
          blockNumber: response.blockNumber
        })
      })
  }
  //#endregion

  //#region FUNCION ADDRESS
  removeAddress(index: number): void {
    if (this.id === null) {
      this.addresses.splice(index, 1);
    } else {

    }
  }

  getAddressValue(): Address {
    const postalCodeValue = this.userForm.get('addressForm.postalCode')?.value;
    const address: Address = {
      streetAddress:
        this.userForm.get('addressForm.streetAddress')?.value || '',
      number: this.userForm.get('addressForm.number')?.value || 0,
      floor: this.userForm.get('addressForm.floor')?.value || 0,
      apartment: this.userForm.get('addressForm.apartment')?.value || '',
      city: this.userForm.get('addressForm.city')?.value || '',
      province: this.userForm.get('addressForm.province')?.value || '',
      country: this.userForm.get('addressForm.country')?.value || '',
      postalCode: postalCodeValue ? parseInt(postalCodeValue, 10) : 0
    };
    return address;
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

  addAddress(): void {
    if (this.userForm.get('addressForm')?.valid) {
      const addressValue = this.getAddressValue()
      if (this.addressIndex == undefined && addressValue) {
        this.addresses.push(addressValue);
      } else if (addressValue && this.addressIndex !== undefined) {
        this.addresses[this.addressIndex] = addressValue;
        this.addressIndex = undefined;
      }
      this.userForm.get('addressForm')?.reset();
    } else {
      this.toastService.sendError("Dirección no válida")
    }
  }

  cancelEditionAddress() {
    this.addressIndex = undefined;
    this.userForm.get('addressForm')?.reset();
  }
  //#endregion
  goBack() {
    this.location.back()
  }

  openInfo() {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.title = 'Detalle de Usuario';
    modalRef.componentInstance.description = 'Pantalla para la gestión integral de usuarios, permitiendo la visualización, edición y administración de datos personales, roles, lotes asociados, direcciones y contactos.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos del Usuario',
        content: [
          {
            strong: 'Email:',
            detail: 'Correo electrónico del usuario.'
          },
          {
            strong: 'Nombre:',
            detail: 'Nombre del usuario.'
          },
          {
            strong: 'Nombre de usuario:',
            detail: 'Nombre de usuario.'
          },
          {
            strong: 'Apellido:',
            detail: 'Apellido del usuario.'
          }
        ]
      },
      {
        title: 'Lista de Roles',
        content: [
          {
            strong: 'Roles:',
            detail: 'Lista de roles del usuario.'
          }
        ]
      },
      {
        title: 'Asociar un lote',
        content: [
          {
            strong: 'Lotes en tenencia:',
            detail: 'Lotes en tenencia.'
          },
          {
            strong: 'Fecha:',
            detail: 'Fecha en formato dd/mm/aaaa.'
          }
        ]
      },
      {
        title: 'Añadir Dirección',
        content: [
          {
            strong: 'Calle:',
            detail: 'Nombre de la calle.'
          },
          {
            strong: 'Número:',
            detail: 'Número de la propiedad'
          },
          {
            strong: 'Piso:',
            detail: 'Piso de la propiedad'
          },
          {
            strong: 'Depto:',
            detail: 'Departamento.'
          },
          {
            strong: 'País:',
            detail: 'País.'
          },
          {
            strong: 'Provincia:',
            detail: 'Provincia.'
          },
          {
            strong: 'Ciudad:',
            detail: 'Ciudad.'
          },
          {
            strong: 'Código Postal:',
            detail: 'Código postal.'
          }
        ]
      },
      {
        title: 'Añadir Contactos',
        content: [
          {
            strong: 'Tipo Contacto:',
            detail: 'Tipo del contacto.'
          },
          {
            strong: 'Contacto:',
            detail: 'Información del contacto'
          }
        ]
      }
    ];

  }
}
