import {Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {DeleteLaterService} from "../../../delete-later.service";
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle
} from "@ng-bootstrap/ng-bootstrap";
import {RoleSelectorComponent} from "../role-selector/role-selector.component";

@Component({
  selector: 'app-black-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    NgbDropdown,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    RoleSelectorComponent
  ],
  templateUrl: './black-sidebar.component.html',
  styleUrl: './black-sidebar.component.scss'
})
export class BlackSidebarComponent {

  changeService = inject(DeleteLaterService)

  change(): void {
    this.changeService.change()
  }

}
