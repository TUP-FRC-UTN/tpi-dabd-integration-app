import { Component, inject, OnInit } from '@angular/core';
import { AuthDTO } from '../../../models/authorization/authorized-range.model';
import { AuthRangeService } from '../../../services/authorized-range/auth-range.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-auth',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './list-auth.component.html'
})
export class ListAuthComponent implements OnInit {
  private serviceAuhtRange = inject(AuthRangeService);

  authRecords: AuthDTO[] = [];
  docNumber: number | null = null;

  constructor() {}
  ngOnInit(): void {
    this.getAuthRecords();
  }

  getAuthRecords(): void {
    if (this.docNumber !== null) {
      this.serviceAuhtRange.getAuhtByDocNumber(this.docNumber).subscribe({
        next: (data) => {
          console.log(data);
          this.authRecords = data;
        },
        error: (err) => {
          console.error('Error fetching auth records:', err);
        },
        complete: () => {
          console.log('Fetch auth records complete.');
        },
      });
    } else {
      this.serviceAuhtRange.getAllAuths().subscribe({
        next: (data) => {
          console.log(data);
          this.authRecords = data;
        },
        error: (err) => {
          console.error('Error fetching all auth records:', err);
        },
        complete: () => {
          console.log('Fetch all auth records complete.');
        },
      });
    }
  }

  translateDays(daysString: string): string {
    if (!daysString) {
      return 'No especificado';
    }
    const daysArray = daysString.split('-').map((day) => day.trim());
    const translatedDays = daysArray.map((day) => this.translateDay(day));
    return translatedDays.join(', ');
  }

  translateDay(day: string): string {
    switch (day) {
      case 'SUNDAY':
        return 'Domingo';
      case 'MONDAY':
        return 'Lunes';
      case 'TUESDAY':
        return 'Martes';
      case 'WEDNESDAY':
        return 'Miércoles';
      case 'THURSDAY':
        return 'Jueves';
      case 'FRIDAY':
        return 'Viernes';
      case 'SATURDAY':
        return 'Sábado';
      default:
        return day;
    }
  }

  translateVisitorType(type: string) {
    switch (type) {
      case 'VISITOR':
        return 'Visita';
      case 'OWNER':
        return 'Propietario';
      case 'WORKER':
        return 'Trabajador';
      case 'EMPLOYEE':
        return 'Empleado';
      case 'SUPPLIER':
        return 'Proveedor';
      default:
        return type;
    }
  }
}
