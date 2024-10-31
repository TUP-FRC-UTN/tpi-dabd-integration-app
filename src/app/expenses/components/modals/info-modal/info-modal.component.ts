import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [],
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.css'
})
export class InfoModalComponent {
  @Input() title!: string;
  @Input() body!: string;
  @Output() onAccept: EventEmitter<void> = new EventEmitter<void>();

  accept() {
    this.onAccept.emit();
  }
}

