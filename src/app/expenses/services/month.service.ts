import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonthService {

  private readonly monthsAbbr: string[] = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  getMonthAbbr(monthNumber: number): string | null {
    if (monthNumber < 1 || monthNumber > 12) {
      return null;
    }
    return this.monthsAbbr[monthNumber - 1];
  }
}
