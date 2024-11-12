import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface BodyItem {
  title: string;
  content: Content[];
}

interface Content {
  strong: string,
  detail: string
}

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() notes: string[] = [];
  @Input() body: BodyItem[] = [];

  constructor(public activeModal: NgbActiveModal) {}
}
