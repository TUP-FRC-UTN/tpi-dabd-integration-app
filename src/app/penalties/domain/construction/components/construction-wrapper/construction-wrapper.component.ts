import { Component } from '@angular/core';
import { ConstructionListComponent } from "../construction-list/construction-list.component";
import { MainContainerComponent } from '../../../../../../projects/ngx-dabd-grupo01/src/public-api';

@Component({
  selector: 'app-construction-wrapper',
  standalone: true,
  imports: [MainContainerComponent, ConstructionListComponent],
  templateUrl: './construction-wrapper.component.html',
  styleUrl: './construction-wrapper.component.css'
})
export class ConstructionWrapperComponent {

}
