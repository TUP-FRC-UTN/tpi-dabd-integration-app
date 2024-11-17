import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidevar',
  standalone: true,
  imports: [ RouterModule, NgbDropdownModule, NgbCollapseModule],
  templateUrl: './sidevar.component.html',
  styleUrl: './sidevar.component.css'
})
export class SidevarComponent {
  isMenuCollapsed = true;
}
