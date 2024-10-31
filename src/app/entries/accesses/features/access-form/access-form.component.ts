import { Component } from '@angular/core';
import { AuthRangeService } from '../../../services/authorized-range/auth-range.service';
import { Router } from '@angular/router';
import { AccessDTO } from '../../../models/accesses/access-record.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-access-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './access-form.component.html',
})
export class AccessFormComponent {
  access: AccessDTO = {
    first_name: '',
    last_name: '',
    doc_number: 0,
    action: 'ENTRY',
    vehicle_type: 'CAR',
    vehicle_description: '',
    vehicle_reg: '',
    comments: '',
  };

  userId = 123;

  constructor(private accessService: AuthRangeService, private router: Router) {}

  submitAccessForm() {
    console.log('Enviando datos de acceso:', this.access);

    this.accessService.authorizeAccess(this.access, this.userId).subscribe({
      next: (response) => {
        console.log('Acceso registrado con éxito:', response);
        alert('Acceso registrado correctamente.');
        this.router.navigate(['/access-query']);
      },
      error: (err) => {
        console.error('Error al registrar el acceso:', err);
        alert('Error al registrar el acceso. Verifica los datos e intenta nuevamente.');
      },
    });
  }
}
