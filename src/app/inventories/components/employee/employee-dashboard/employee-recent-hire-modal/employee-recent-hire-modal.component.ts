import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-employee-recent-hire-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Empleados Contratados en el Último Mes</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Tipo</th>
              <th>Fecha de Contratación</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of recentHires">
              <td>{{ employee.firstName }}</td>
              <td>{{ employee.lastName }}</td>
              <td>{{ employee.employeeType }}</td>
              <td>{{ employee.hiringDate | date:'dd/MM/yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="recentHires.length === 0" class="text-center py-3">
        <p class="text-muted">No hay empleados contratados en el último mes</p>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Cerrar</button>
    </div>
  `
})
export class EmployeeRecentHireModalComponent {
  @Input() recentHires: Employee[] = [];

  constructor(public activeModal: NgbActiveModal) {}
}