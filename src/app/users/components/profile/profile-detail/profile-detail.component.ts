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
}
