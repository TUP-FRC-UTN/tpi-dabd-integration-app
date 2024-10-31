import {Component, inject} from '@angular/core';
import { NavbarComponent } from 'ngx-dabd-2w1-core';
import { MenuItems } from 'ngx-dabd-2w1-core';
import { Router } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RoleSelectorComponent } from '../role-selector/role-selector.component';
import {DeleteLaterService} from "../../../delete-later.service";



@Component({
  selector: 'app-custom-nav-bar',
  standalone: true,
  imports: [NavbarComponent, RouterLink, RouterOutlet, NgbDropdownModule, RoleSelectorComponent],
  templateUrl: './custom-nav-bar.component.html',
  styleUrl: './custom-nav-bar.component.scss',
})
export class CustomNavBarComponent {
  title = 'template-app';

  private changeToBlack = inject(DeleteLaterService)

  change() {
    this.changeToBlack.change()
  }
}
