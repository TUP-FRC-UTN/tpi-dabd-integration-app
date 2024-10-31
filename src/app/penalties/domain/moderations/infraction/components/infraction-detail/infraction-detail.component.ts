import { Component, inject, OnInit } from '@angular/core';
import { InfractionResponseDTO } from '../../models/infraction.model';
import { InfractionServiceService } from '../../services/infraction-service.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InfractionClaimListComponent } from "../infraction-claim-list/infraction-claim-list.component";
import { FormsModule } from '@angular/forms';
import { MainContainerComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-infraction-detail',
  standalone: true,
  imports: [CommonModule, MainContainerComponent, InfractionClaimListComponent, FormsModule],
  templateUrl: './infraction-detail.component.html',
  styleUrl: './infraction-detail.component.scss',
})
export class InfractionDetailComponent implements OnInit {
  infraction: InfractionResponseDTO | undefined;
  infractionService = inject(InfractionServiceService);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const id = params['id'];
      this.getInfractionById(id);
    });
  }

  getInfractionById(id: number) {
    this.infractionService
      .getInfractionById(id)
      .subscribe((infraction) => {
        this.infraction = infraction;
      });
  }

  goBack(): void {
    window.history.back();
  }
}
