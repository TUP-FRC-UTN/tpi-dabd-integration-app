import { Component } from '@angular/core';
import { BlackSidebarComponent } from '../black-sidebar/black-sidebar.component';
import { SidebarComponent } from '../../../../../projects/ngx-dabd-grupo01/src/lib/sidebar/sidebar.component';

@Component({
  selector: 'app-black-navbar',
  standalone: true,
  imports: [BlackSidebarComponent, SidebarComponent],
  templateUrl: './black-navbar.component.html',
  styleUrl: './black-navbar.component.scss',
})
export class BlackNavbarComponent {}
