import { AbstractControl, ValidationErrors } from "@angular/forms";

export function bankAccountValidator(control: AbstractControl): ValidationErrors | null {

    if (!control.parent) {
        return null;
    }

    const bankAccount = control.parent.get('bankAccount')?.value;

    // valido que tenga 22 dígitos
    if (bankAccount.length !== 22) {
      return { validBankAccount: true }
    }
    return null;
  }