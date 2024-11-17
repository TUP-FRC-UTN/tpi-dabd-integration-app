import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-employee-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MainContainerComponent],
  templateUrl: './employee-contact.component.html',
  styleUrl: './employee-contact.component.css'
})
export class EmployeeContactComponent {
  contactForm = new FormGroup({
    contacts: new FormArray([])
  });

  get contacts() {
    return this.contactForm.get('contacts') as FormArray;
  }

  createContactFormGroup(): FormGroup {
    return new FormGroup({
      contactType: new FormControl('', [Validators.required]),
      contactValue: new FormControl('', [Validators.required])
    });
  }

  addContact() {
    if (this.contacts.length < 2) {
      this.contacts.push(this.createContactFormGroup());
    }
  }

  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  ngOnInit() {
    // Add first contact by default
    this.addContact();
  }

}
