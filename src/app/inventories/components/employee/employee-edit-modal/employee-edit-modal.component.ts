import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Employee, EmployeeType } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatusType } from '../../../models/inventory.model';

@Component({
  selector: 'app-employee-edit-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employee-edit-modal.component.html',
  styleUrl: './employee-edit-modal.component.css'
})
export class EmployeeEditModalComponent implements OnInit {
  @Input() isModalOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  
  employee: Employee | null = null;
  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);
  statusTypes = Object.values(StatusType);

  constructor(private employeeService: EmployeesService) {}

  ngOnInit(): void {
    this.employeeService.getSelectedEmployee().subscribe(employee => {
      if (employee) {
        // Create a copy of the employee to avoid directly modifying the original
        this.employee = { ...employee };
      }
    });
  }

  onSave() {
    if (this.employee) {
      this.employeeService.updateEmployee(this.employee).subscribe({
        next: () => {
          this.onClose();
          // You might want to refresh the employee list here
          location.reload(); // Or use a more elegant solution to refresh the list
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          alert('Error al actualizar el empleado');
        }
      });
    }
  }

  onClose() {
    this.isModalOpen = false;
    this.closeModal.emit();
  }
}
