import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-active-employees-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Empleados Activos</h4>
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
              <th>Documento</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of activeEmployees">
              <td>{{ employee.firstName }}</td>
              <td>{{ employee.lastName }}</td>
              <td>{{ employee.employeeType }}</td>
              <td>{{ employee.docNumber }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Cerrar</button>
    </div>
  `
})
export class ActiveEmployeesModalComponent {
  @Input() activeEmployees: Employee[] = [];

  constructor(public activeModal: NgbActiveModal) {}
}