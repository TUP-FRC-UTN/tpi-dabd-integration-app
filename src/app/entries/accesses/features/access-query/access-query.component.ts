import { Component } from '@angular/core';
import { AccessRecordProcessed } from '../../../models/accesses/access-record.model';
import { AccessService } from '../../../services/access/access.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-access-query',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-query.component.html',
})
export class AccessQueryComponent {
  accessType: string = '';
  plotId?: number;
  dateFrom: string = '';
  dateTo: string = '';
  visitorId?: number;
  supplierId?: number;

  accessRecords: AccessRecordProcessed[] = [];

  constructor(private accessService: AccessService) {}

  queryAccess() {
    const params = {
      access_type: this.accessType,
      plot_id: this.plotId,
      date_from: this.dateFrom,
      date_to: this.dateTo,
      visitor_id: this.visitorId,
      supplier_id: this.supplierId,
    };

    this.accessService
      .getAccessRecords(this.accessType, params)
      .subscribe((records) => {
        this.accessRecords = records.map((record) => {
          return {
            ...record,
            entry_date_time: new Date(
              record.entry_date_time[0],
              record.entry_date_time[1] - 1,
              record.entry_date_time[2],
              record.entry_date_time[3],
              record.entry_date_time[4]
            ),
            exit_date_time: new Date(
              record.exit_date_time[0],
              record.exit_date_time[1] - 1,
              record.exit_date_time[2],
              record.exit_date_time[3],
              record.exit_date_time[4]
            ),
          };
        });
      });
  }
}
