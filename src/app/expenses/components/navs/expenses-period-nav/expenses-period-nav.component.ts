import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-expenses-period-nav',
  standalone: true,
  templateUrl: './expenses-period-nav.component.html',
  styleUrl: './expenses-period-nav.component.css'
})
export class ExpensesPeriodNavComponent implements OnInit {
   id: string | null = null;

  // Inyectar `ActivatedRoute` en el constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Acceder al parámetro de la ruta en el `ngOnInit`
    this.id = this.route.snapshot.paramMap.get('period_id');
  }
}
