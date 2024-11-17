import { ChangeDetectorRef, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { EmployeeSchedule } from '../../../models/employee.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeesService } from '../../../services/employees.service';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-view-acess',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-view-acess.component.html',
  styleUrl: './employee-view-acess.component.css'
})
export class EmployeeViewAcessComponent {
  @ViewChild('scheduleDetailModal') modalContent!: TemplateRef<any>;

  selectedSchedules: EmployeeSchedule[] = [];
  currentSchedule: EmployeeSchedule | null = null;
  loading = false;
  error: string | null = null;

  private modalService = inject(NgbModal);
  private employeesService = inject(EmployeesService);
  private cdr = inject(ChangeDetectorRef);

  private readonly dayOrderMap: { [key: string]: number } = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6,
    'Domingo': 7
  };

  showEmployeeSchedule(employeeId: number): void {
    console.log('showEmployeeSchedule called with ID:', employeeId);
    if (!employeeId) {
      console.error('[EmployeeViewAccess] No se proporcionó ID de empleado válido');
      return;
    }

    this.loading = true;
    this.error = null;
    this.selectedSchedules = [];
    this.currentSchedule = null;

    this.employeesService.getEmployeeSchedules(employeeId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        const schedules = Array.isArray(response) ? response : [response];
        console.log('[EmployeeViewAccess] Horarios recibidos:', schedules);
        
        if (!schedules) {
          console.warn('[EmployeeViewAccess] La respuesta de horarios es nula o indefinida');
          this.error = 'No se encontraron horarios para este empleado';
          this.openModal();
          return;
        }

        if (schedules.length === 0) {
          console.warn('[EmployeeViewAccess] No se encontraron horarios para el empleado:', employeeId);
          this.error = 'No se encontraron horarios para este empleado';
          this.openModal();
          return;
        }

        this.selectedSchedules = schedules;
        this.currentSchedule = this.selectedSchedules[0];
        
        if (!this.currentSchedule) {
          console.warn('[EmployeeViewAccess] No se pudo establecer el horario actual');
        }

        console.log('[EmployeeViewAccess] Horario actual establecido:', this.currentSchedule);
        setTimeout(() => this.openModal(), 0);
      },
      error: (err) => {
        console.error('[EmployeeViewAccess] Error al cargar horarios:', err);
        this.error = 'No se encontraron horarios para este empleado';
        this.openModal();
      }
    });
  }

  getDaySchedules(): Array<{day: string, entry: string, exit: string}> {
    if (!this.currentSchedule?.day_schedules) {
      console.warn('[EmployeeViewAccess] Intentando obtener horarios diarios sin un horario actual válido');
      return [];
    }
    
    try {
      return Object.entries(this.currentSchedule.day_schedules)
        .map(([day, schedule]) => {
          if (!schedule.entry_time || !schedule.exit_time) {
            console.warn(`[EmployeeViewAccess] Horarios incompletos para el día ${day}`);
          }
          return {
            day: this.getDayName(day),
            entry: this.formatTime(schedule.entry_time),
            exit: this.formatTime(schedule.exit_time)
          };
        })
        .sort((a, b) => this.getDayOrder(a.day) - this.getDayOrder(b.day));
    } catch (error) {
      console.error('[EmployeeViewAccess] Error al procesar los horarios diarios:', error);
      return [];
    }
  }

  private getDayOrder(day: string): number {
    const order = this.dayOrderMap[day];
    if (!order) {
      console.warn(`[EmployeeViewAccess] Día no reconocido en el ordenamiento: ${day}`);
    }
    return order || 8;
  }

  private openModal(): void {
    if (!this.modalContent) {
      console.error('[EmployeeViewAccess] Template del modal no encontrado');
      return;
    }

    try {
      const modalRef = this.modalService.open(this.modalContent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        centered: true
      });

      modalRef.result.then(
        () => {
          this.resetState();
        },
        (reason) => {
          console.warn('[EmployeeViewAccess] Modal cerrado por:', reason);
          this.resetState();
        }
      );
    } catch (error) {
      console.error('[EmployeeViewAccess] Error al abrir el modal:', error);
    }
  }

  private resetState(): void {
    try {
      this.selectedSchedules = [];
      this.currentSchedule = null;
      this.error = null;
      console.log('[EmployeeViewAccess] Estado reiniciado correctamente');
    } catch (error) {
      console.error('[EmployeeViewAccess] Error al reiniciar el estado:', error);
    }
  }

  getDayName(key: string): string {
    const days: Record<string, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    
    if (!days[key]) {
      console.warn(`[EmployeeViewAccess] Clave de día no reconocida: ${key}`);
    }
    
    return days[key] || key;
  }

  formatTime(time: string): string {
    if (!time) {
      console.warn('[EmployeeViewAccess] Intentando formatear tiempo nulo o vacío');
      return '';
    }
    try {
      return time.substring(0, 5);
    } catch (error) {
      console.error('[EmployeeViewAccess] Error al formatear tiempo:', error);
      return '';
    }
  }

  setCurrentSchedule(schedule: EmployeeSchedule): void {
    if (!schedule) {
      console.warn('[EmployeeViewAccess] Intentando establecer un horario nulo como actual');
      return;
    }
    this.currentSchedule = schedule;
    console.log('[EmployeeViewAccess] Nuevo horario actual establecido:', schedule);
  }
}