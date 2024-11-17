import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DaySchedule, EmployeeSchedule, ShiftType } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { ToastService } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';

interface DayOfWeek {
  id: string;
  label: string;
}

@Component({
  selector: 'app-employee-access',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-access.component.html',
  styleUrl: './employee-access.component.css'
})
export class EmployeeAccessComponent implements OnInit {
  // Inputs y Outputs
  @Input() employeeId?: number;
  @Input() scheduleToEdit?: EmployeeSchedule;
  @Output() schedulesSaved = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  // Services
  private scheduleService = inject(EmployeesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Variables de fecha
  today = new Date().toISOString().split('T')[0];
  oneYearFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  // Variables de estado
  selectedDays: string[] = [];
  selectedShift: ShiftType = ShiftType.MORNING;
  showDaysError = false;

  // Datos estáticos
  daysOfWeek: DayOfWeek[] = [
    { id: 'MONDAY', label: 'Lunes' },
    { id: 'TUESDAY', label: 'Martes' },
    { id: 'WEDNESDAY', label: 'Miércoles' },
    { id: 'THURSDAY', label: 'Jueves' },
    { id: 'FRIDAY', label: 'Viernes' },
    { id: 'SATURDAY', label: 'Sábado' },
    { id: 'SUNDAY', label: 'Domingo' }
  ];

  isEditMode = false;

  shiftTypes = Object.values(ShiftType);

  shiftTypeLabels: { [key in ShiftType]: string } = {
    [ShiftType.MORNING]: 'Mañana',
    [ShiftType.AFTERNOON]: 'Tarde',
    [ShiftType.NIGHT]: 'Noche'
  };

  predefinedShifts = {
    [ShiftType.MORNING]: { entry: '08:00', exit: '16:00' },
    [ShiftType.AFTERNOON]: { entry: '16:00', exit: '00:00' },
    [ShiftType.NIGHT]: { entry: '00:00', exit: '08:00' }
  };

  // Formulario anterior (comentado)
  /*
  accessForm = new FormGroup({
    dateFrom: new FormControl('', [Validators.required]),
    dateTo: new FormControl('', [Validators.required]),
    shiftType: new FormControl<ShiftType>(ShiftType.MORNING, [Validators.required]),
    entryTime: new FormControl('', [Validators.required]),
    exitTime: new FormControl('', [Validators.required])
  });
  */

  // Nuevo formulario con validaciones
  accessForm = new FormGroup({
    dateFrom: new FormControl<string>(this.today, {
      validators: [Validators.required, this.dateValidator()],
      nonNullable: true,
    }),
    dateTo: new FormControl<string>(this.oneYearFromNow, {
      validators: [Validators.required, this.dateValidator()],
      nonNullable: true,
    }),
    shiftType: new FormControl<ShiftType>(ShiftType.MORNING, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    entryTime: new FormControl<string>(this.predefinedShifts[ShiftType.MORNING].entry, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    exitTime: new FormControl<string>(this.predefinedShifts[ShiftType.MORNING].exit, {
      validators: [Validators.required],
      nonNullable: true,
    })
  });

  constructor() {}

  // Método OnInit anterior (comentado)
  // ngOnInit(): void {}

  // Nuevo método OnInit con inicialización
  ngOnInit(): void {
    this.selectedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    
    if (this.scheduleToEdit) {
      this.isEditMode = true;
      this.initializeEditForm();
    }

    this.accessForm.get('shiftType')?.valueChanges.subscribe(shiftType => {
      if (shiftType) {
        const shift = this.predefinedShifts[shiftType as ShiftType];
        this.accessForm.patchValue({
          entryTime: shift.entry,
          exitTime: shift.exit
        });
      }
    });
  }

  // Métodos de manipulación de días y turnos
  toggleDay(dayId: string): void {
    const index = this.selectedDays.indexOf(dayId);
    if (index === -1) {
      this.selectedDays.push(dayId);
    } else {
      this.selectedDays.splice(index, 1);
    }
    this.showDaysError = false;
  }

  // Método toggleShift anterior (comentado)
  /*
  toggleShift(shift: ShiftType): void {
    this.selectedShift = shift;
    this.accessForm.get('shiftType')?.setValue(shift);
  }
  */

  // Nuevo método toggleShift con horarios predefinidos
  toggleShift(shift: ShiftType): void {
    this.selectedShift = shift;
    this.accessForm.get('shiftType')?.setValue(shift);
    
    if (!this.isEditMode) {
    const predefinedShift = this.predefinedShifts[shift];
    this.accessForm.patchValue({
      entryTime: predefinedShift.entry,
      exitTime: predefinedShift.exit
    });
    }
  }

  // Métodos de utilidad
  getSelectedDaysLabels(): string[] {
    return this.selectedDays.map(dayId => 
      this.daysOfWeek.find(day => day.id === dayId)?.label || dayId
    );
  }

  isFormValid(): boolean {
    return this.accessForm.valid && this.selectedDays.length > 0;
  }

  // Métodos de guardado y validación
  saveSchedule(): void {
    if (!this.isFormValid() || !this.employeeId) {
      if (this.selectedDays.length === 0) {
        this.showDaysError = true;
      }
      return;
    }

    const formValue = this.accessForm.value;
    const daySchedules: { [key: string]: DaySchedule } = {};

    this.selectedDays.forEach(day => {
      daySchedules[day] = {
        entry_time: formValue.entryTime!,
        exit_time: formValue.exitTime!
      };
    });

    const schedule: EmployeeSchedule = {
      employee_id: this.employeeId,
      start_date: new Date(formValue.dateFrom!).toISOString(),
      finish_date: new Date(formValue.dateTo!).toISOString(),
      shift_type: formValue.shiftType!,
      day_schedules: daySchedules
    };

    this.scheduleService.createSchedule(schedule).subscribe({
      next: (response) => {
        console.log('Horario guardado exitosamente', response);
        this.toast.sendSuccess('Horario guardado exitosamente');
        this.resetForm();
        this.closeModal.emit();
        this.schedulesSaved.emit();
        this.router.navigate(['inventories/employees/list']);
        
      },
      error: (error) => {
        console.log('Error al guardar el horario', error);
        this.toast.sendError('Error al guardar el horario');
      }
    });
  }

  // Método resetForm anterior (comentado)
  /*
  resetForm(): void{
    this.accessForm.reset({
      dateFrom: '',
      dateTo: '',
      shiftType: ShiftType.MORNING,
      entryTime: '',
      exitTime: ''
    });
    this.selectedDays = [];
    this.selectedShift = ShiftType.MORNING;
    this.showDaysError = false;
  }
  */

  // Nuevo método resetForm con valores predefinidos
  resetForm(): void {
    this.accessForm.reset({
      dateFrom: this.today,
      dateTo: this.oneYearFromNow,
      shiftType: ShiftType.MORNING,
      entryTime: this.predefinedShifts[ShiftType.MORNING].entry,
      exitTime: this.predefinedShifts[ShiftType.MORNING].exit
    });
    this.selectedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    this.selectedShift = ShiftType.MORNING;
    this.showDaysError = false;
  }

  // Métodos adicionales
  newEmployee() {
    this.employeeId = undefined;
    this.schedulesSaved.emit();
  }

  // Validadores
  dateValidator() {
    return (control: FormControl): {[key: string]: any} | null => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return { 'pastDate': true };
      }
      return null;
    };
  }

  timeValidator() {
    return (control: FormControl): {[key: string]: any} | null => {
      if (!control.value) return null;

      const [hours, minutes] = control.value.split(':').map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      const dateFromValue = this.accessForm?.get('dateFrom')?.value;
      if (!dateFromValue) return null;

      const dateFrom = new Date(dateFromValue);
      const now = new Date();

      if (dateFrom.getDate() === now.getDate() && 
          dateFrom.getMonth() === now.getMonth() && 
          dateFrom.getFullYear() === now.getFullYear()
          ) {
        return { 'pastTime': true };
      }
      return null;
    };
  }

  updateSchedule(): void {
    if (!this.isFormValid() || !this.employeeId || !this.scheduleToEdit) {
      if (this.selectedDays.length === 0) {
        this.showDaysError = true;
      }
      return;
    }

    const formValue = this.accessForm.value;
    const daySchedules: { [key: string]: DaySchedule } = {};

    this.selectedDays.forEach(day => {
      daySchedules[day] = {
        entry_time: formValue.entryTime!,
        exit_time: formValue.exitTime!
      };
    });

    const updatedSchedule: EmployeeSchedule = {
    
      employee_id: this.employeeId,
      start_date: new Date(formValue.dateFrom!).toISOString(),
      finish_date: new Date(formValue.dateTo!).toISOString(),
      shift_type: formValue.shiftType!,
      day_schedules: daySchedules
    };

    this.scheduleService.updateSchedule(updatedSchedule).subscribe({
      next: (response) => {
        console.log('Horario actualizado exitosamente', response);
        this.toast.sendSuccess('Horario actualizado exitosamente');
        this.resetForm();
        this.closeModal.emit();
        this.schedulesSaved.emit();
        this.isEditMode = false;
      },
      error: (error) => {
        console.error('Error al actualizar el horario', error);
        this.toast.sendError('Error al actualizar el horario');
      }
    });
  }

  private initializeEditForm(): void {
    if (!this.scheduleToEdit) return;

    // Convert dates to YYYY-MM-DD format for input[type="date"]
    const startDate = new Date(this.scheduleToEdit.start_date).toISOString().split('T')[0];
    const endDate = new Date(this.scheduleToEdit.finish_date).toISOString().split('T')[0];

    // Get first day schedule for times (assuming all days have same schedule)
    const firstDaySchedule = Object.values(this.scheduleToEdit.day_schedules)[0];
    
    this.accessForm.patchValue({
      dateFrom: startDate,
      dateTo: endDate,
      shiftType: this.scheduleToEdit.shift_type,
      entryTime: firstDaySchedule?.entry_time?.substring(0, 5) || '',
      exitTime: firstDaySchedule?.exit_time?.substring(0, 5) || ''
    });

    this.selectedShift = this.scheduleToEdit.shift_type;
    this.selectedDays = Object.keys(this.scheduleToEdit.day_schedules);
  }
}