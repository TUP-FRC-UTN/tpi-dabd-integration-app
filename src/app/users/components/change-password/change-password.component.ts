import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { User } from '../../models/user';
import { easingEffects } from 'chart.js/helpers';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainContainerComponent, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  changePassForm!: FormGroup
  oldPassword!: string;
  newPassword!: string;

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sessionService: SessionService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.changePassForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      repeatPassword: ['', [Validators.required]],
    });
  }

  arePasswordEquals() {
    return this.changePassForm.get('newPassword')?.value === this.changePassForm.get('repeatPassword')?.value
  }

  isValidPassword() {
    this.newPassword = this.changePassForm.get('newPassword')?.value
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return regex.test(this.newPassword);
  }

  onSubmit() {
    this.submitted = true
    if (this.changePassForm.valid &&
      this.isValidPassword() &&
      this.arePasswordEquals()) {
      this.newPassword = this.changePassForm.get('newPassword')?.value
      this.oldPassword = this.changePassForm.get('oldPassword')?.value

      this.userService.changePassword(this.oldPassword, this.newPassword).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("Contraseña actualizada con éxito.")
          this.router.navigate(['']);
        },
        error: (error) => {
          if (error.status === 401) {
            this.toastService.sendError("Contraseña actual incorrecta")
          } else {
            this.toastService.sendError("Hubo un error al actualizar la contraseña, intentalo nuevamente")
          }
        },
      });

    }
  }

  getUserId() {
    let user: User = this.sessionService.getItem('user')

    return user.id!!
  }

  onCancel() {
    this.router.navigate(['users/profile/detail'])
  }

  openInfo() { }

}
