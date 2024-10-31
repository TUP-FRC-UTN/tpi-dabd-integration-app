import { Component } from '@angular/core';
import {BlackSidebarComponent} from "../black-sidebar/black-sidebar.component";

@Component({
  selector: 'app-black-navbar',
  standalone: true,
  imports: [
    BlackSidebarComponent
  ],
  templateUrl: './black-navbar.component.html',
  styleUrl: './black-navbar.component.scss'
})
export class BlackNavbarComponent {

}
