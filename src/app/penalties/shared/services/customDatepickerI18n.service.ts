import { Injectable } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

// Definir el tipo de los idiomas admitidos
type SupportedLanguages = 'es';

const I18N_VALUES: Record<SupportedLanguages, { weekdays: string[]; months: string[]; weekLabel: string }> = {
  es: {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    weekLabel: 'Sem',
  },
};

// Servicio de idioma
@Injectable({ providedIn: 'root' })
export class I18n {
  language: SupportedLanguages = 'es'; // Establece el idioma a 'es' para español.
}

// Servicio personalizado de traducción del DatePicker
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  constructor(private _i18n: I18n) {
    super();
  }

  getWeekdayLabel(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }

  override getWeekLabel(): string {
    return I18N_VALUES[this._i18n.language].weekLabel;
  }

  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}
