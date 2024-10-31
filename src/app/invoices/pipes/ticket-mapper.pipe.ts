import { Pipe, PipeTransform } from '@angular/core';
import { TicketDto } from '../models/TicketDto';

@Pipe({
  name: 'ticketMapper',
  standalone: true
})
export class TransformTicketPipe implements PipeTransform {

  transform(ticketDto: any): TicketDto {
    return {
      id: ticketDto.id,
      expirationDate: ticketDto.expirationDate.toString(),
      issueDate: ticketDto.issueDate.toString(),
      ownerId: ticketDto.owner,
      status: ticketDto.status,
      ticketNumber: ticketDto.ticketNumber,
      ticketDetails: ticketDto.ticketDetails,
      lotId: ticketDto.lotId.toString(),
    };
  }

}