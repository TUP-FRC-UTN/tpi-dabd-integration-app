import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'periodToMonthYear',
  standalone: true,
})
export class PeriodToMonthYearPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: string): string {
    const [month, year] = value.split('/');
    const date = new Date(+`20${year}`, +month - 1); // Crear una fecha con el formato correcto
    return this.datePipe.transform(date, 'MMMM yyyy', 'es-ES')!.toString();
  }
}
