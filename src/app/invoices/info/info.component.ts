import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

    // Recibe los datos como un input
    @Input() data: { role: string } = { role: '' };

    
  constructor(public activeModal: NgbActiveModal) {}

 
 
   // Método adicional si necesitas alguna lógica específica dependiendo del rol
   get isAdmin(): boolean {
     return this.data?.role === 'admin';
   }
 
   get isOwner(): boolean {
     return this.data?.role === 'owner';
   }
 }

