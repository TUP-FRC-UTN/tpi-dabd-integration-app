import { AbstractControl, ValidationErrors } from "@angular/forms";

export function cuitValidator(control: AbstractControl): ValidationErrors | null {

    if (!control.parent) {
        return null;
    }

    const cuit = control.parent.get('cuit')?.value;

    if (cuit.length !== 11) {
      return { invalidCuit: true }
    }
  
    const [checkDigit, ...rest] = cuit
      .split('')
      .map(Number)
      .reverse();
  
    const total = rest.reduce(
      (acc: any, cur: any, index: any) => acc + cur * (2 + (index % 6)),
      0,
    );
  
    const mod11 = 11 - (total % 11);
  
    if (mod11 === 11) {
      return checkDigit !== 0 ? { invalidCuit: checkDigit !== 0 } : null
    }
  
    if (mod11 === 10) {
      return { invalidCuit: true }
    }
  
    return checkDigit !== mod11 ? { invalidCuit: checkDigit !== mod11 } : null
  }