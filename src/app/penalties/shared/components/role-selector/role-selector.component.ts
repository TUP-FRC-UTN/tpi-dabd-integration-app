import {Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
// import {DeleteLaterService} from "../../../delete-later.service";

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrl: './role-selector.component.scss',
})
export class RoleSelectorComponent {
  roles: string[] = ['OWNER', 'ADMIN', 'USER'];
  selectedRole: string = '';

  lotes: number[] = [1, 2, 3, 4, 5];
  selectedLotes: number[] = [];

  userIds: number[] = [1, 2, 3, 4, 5];
  selectedUserId: number = 0;
  isOwner: boolean = false;

  constructor(private roleService: RoleService) {}

  // protected changeService = inject(DeleteLaterService)

  onRoleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    this.roleService.changeRole(selectedValue);
    this.selectedRole = selectedValue;
    this.isOwner = selectedValue === 'OWNER';
    console.log(`Selected role: ${selectedValue}`);
  }

  onLotesChange(event: any) {
    // Convertir a un array de números extrayendo solo el segundo valor de cada opción
    this.selectedLotes = Array.from(
      event.target.selectedOptions,
      (option: any) => {
        const value = option.value.split(': ')[1]; // Suponiendo que el formato es "0: 1"
        return Number(value); // Convertir a número
      }
    );

    // Cambiar los lotes en el roleService
    this.roleService.changeLotes(this.selectedLotes);

    console.log(`Selected lotes: ${this.selectedLotes}`);
  }

  onUserIdChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    this.selectedUserId = +selectedValue;
    this.roleService.changeUserId(this.selectedUserId);
    console.log(`Selected User ID: ${this.selectedUserId}`);
  }
}
