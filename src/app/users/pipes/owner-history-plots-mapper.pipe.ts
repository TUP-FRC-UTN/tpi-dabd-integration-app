import { Pipe, PipeTransform } from '@angular/core';
import { OwnerPlotHistoryDTO } from '../models/ownerXplot';

@Pipe({
  name: 'ownerPlotHistoryMapper',
  standalone: true
})
export class TransformOwnerPlotHistoryPipe implements PipeTransform {

  transform(ownerPlot: any): OwnerPlotHistoryDTO {
    const startDateArray: [number, number, number, number, number] | null = ownerPlot.start_date || null;
    const dueDateArray: [number, number, number, number, number] | null = ownerPlot.due_date || null;

    return {
      id: ownerPlot.id,
      firstName: ownerPlot.first_name,
      lastName: ownerPlot.last_name,
      ownerType: ownerPlot.owner_type,
      documentNumber: ownerPlot.document_number,
      documentType: ownerPlot.document_type,
      startDate: startDateArray ? new Date(...startDateArray) : null,
      dueDate: dueDateArray ? new Date(...dueDateArray) : null
    };
  }
}

