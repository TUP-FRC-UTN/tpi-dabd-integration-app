import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastsContainer, ToastService } from 'ngx-dabd-grupo01';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,ToastsContainer, FormsModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;
  private toastService = inject(ToastService)


  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ){}
    
  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  
  onSubmit(){
    if(this.forgotForm.valid){
      this.userService.forgotPassword(this.forgotForm.value).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("Email enviado a "+ this.forgotForm.get('email')?.value +" con éxito. Revisa tu casilla de correo.")
          this.router.navigate(['']);
        },
        error: (error) => {
          this.toastService.sendError("Error al enviar el mail, intente nuevamente")
        },
      });}
  }

  cancel(){
    this.router.navigate([''])
  }
}
