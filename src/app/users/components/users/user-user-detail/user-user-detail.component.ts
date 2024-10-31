import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-user-detail',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-user-detail.component.html',
  styleUrl: './user-user-detail.component.css'
})
export class UserUserDetailComponent {
    //#region SERVICIOS
    private userService = inject(UserService);
    private activatedRoute = inject(ActivatedRoute)
    private location = inject(Location)
    //#endregion

    user: any

    //#region FORM REACTIVO
    userForm = new FormGroup({
        email: new FormControl(''),
        firstName: new FormControl(''), // Cambiado
        lastName: new FormControl(''), // Cambiado
        userName: new FormControl(''), // Cambiado
        role: new FormControl('')
      });
    //#endregion

    ngOnInit(): void {
      this.setValues(this.activatedRoute.snapshot.paramMap.get('id'));
    }

    
    //#region SETEO DE VALORES AL FORM
    setValues(userId : string | null) {
      if(userId) {

        this.userForm.controls['email'].disable();
        this.userForm.controls['firstName'].disable();
        this.userForm.controls['lastName'].disable();
        this.userForm.controls['role'].disable();
        this.userForm.controls['userName'].disable();

        this.userService.getUserById(parseInt(userId)).subscribe(
          response => {
            this.user = response;
            this.userForm.patchValue({
                //email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                userName: response.userName,
                // role: this.translateValueEngSpa(response.plotType, this.plotTypeDictionary)
            })
          },
          error => {
            console.error("Error al obtener plot: ", error);
          }
        );
      }
    }
    //#endregion

    goBack() {
      this.location.back()
    }
}
