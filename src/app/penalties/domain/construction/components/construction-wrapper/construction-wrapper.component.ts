import { Component } from '@angular/core';
import { ConstructionListComponent } from "../construction-list/construction-list.component";
import { MainContainerComponent } from '../../../../shared/components/main-container/main-container.component';

@Component({
  selector: 'app-construction-wrapper',
  standalone: true,
  imports: [MainContainerComponent, ConstructionListComponent],
  templateUrl: './construction-wrapper.component.html',
  styleUrl: './construction-wrapper.component.css'
})
export class ConstructionWrapperComponent {

}
