import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expenses-state-period-style',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses-state-period-style.component.html',
  styleUrl: './expenses-state-period-style.component.css',
})
export class ExpensesStatePeriodStyleComponent {
  @Input() estado: string = '';

  getButtonClass(): string {
    const baseClass = 'badge border p-2';

    switch (this.estado.toLowerCase()) {
      case 'abierto':
        return `${baseClass} border-success text-success`;
      case 'cerrado':
        return `${baseClass} border-danger text-danger`;
      case 'liquidación cerrada':
        return `${baseClass} border-secondary text-secondary`;
      case 'Calculado':
        return `${baseClass} border-success text-success`;
      default:
        return `${baseClass} border-secondary text-dark`;
    }
  }
}
