import {AbstractControl, ValidationErrors} from '@angular/forms';

export function birthdateValidation(control: AbstractControl): ValidationErrors | null {
  const fechaNacimiento = new Date(control.value);
  const fechaActual = new Date();
  return fechaNacimiento >= fechaActual ? { fechaInvalida: true } : null;
}
