import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { catchError, of, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../services/session.service';
import { MainContainerComponent, ToastsContainer, ToastService } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastsContainer],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>
  loginForm!: FormGroup;
  userId!: number;
  meetsMinimunSize = false;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private userService: UserService,
    private sessionService: SessionService,
    private toastService: ToastService,
    private router: Router
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.checkImageSize();
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private checkImageSize() {
    setTimeout(() => {
      if (this.imageElement && this.imageElement.nativeElement) {
        const img = this.imageElement.nativeElement;
        const rect = img.getBoundingClientRect();

        this.meetsMinimunSize = 
          rect.width >= 450 && 
          rect.height >= 450;
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log("loginForm: ", this.loginForm.value);
      this.loginService
        .login(this.loginForm.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.toastService.sendError("La contraseña o el email son inválidos, por favor vuelva a intentar");
            } else {
              console.log('An unexpected error occurred:', error);
              this.toastService.sendError("Ha sucedido un error inesperado, por favor vuelva a intentar más tarde.");
            }
            return of(null);
          }),
          switchMap((id: number | null) => {
            if (id) {
              this.userId = id;
              return this.userService.getUserById2(id);
            }
            return of(null);
          }),
          catchError((error: HttpErrorResponse) => {
            console.log('Error fetching user details:', error);
            this.toastService.sendError("Error al recuperar los datos del usuario, por favor vuelva a intentar más tarde.")
            return of(null);
          })
        )
        .subscribe((user) => {
          if (user) {
            this.sessionService.setItem('user', user, 1440); // 1440 = 24 hs.
            this.router.navigate(['/home']);
          }
        });
    }
  }

  signInWithGoogle() {
    
  }

  forgotPassword(){
    this.router.navigate(['/forgotpassword'])
  }

}
