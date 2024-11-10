import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateStatusTicket',
  standalone: true,
})
export class TranslateStatusTicketPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (value === 'PENDING') {
      return 'Pendiente';
    } else if (value === 'PAID') {
      return 'Pagado';
    } else if (value === 'UNDER_REVIEW') {
      return 'En revision';
    } else {
      return 'Anulado';
    }
  }
}
