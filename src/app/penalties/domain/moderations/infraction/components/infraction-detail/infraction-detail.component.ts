import { Component, inject, OnInit } from '@angular/core';
import {
  InfractionDto,
  InfractionResponseDTO,
  InfractionStatusEnum,
  InfractionTab,
} from '../../models/infraction.model';
import { InfractionServiceService } from '../../services/infraction-service.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { InfractionClaimListComponent } from '../infraction-claim-list/infraction-claim-list.component';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../../../shared/services/role.service';
import { firstValueFrom } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfractionProofListComponent } from '../infraction-proof-list/infraction-proof-list.component';
import { NotesListComponent } from '../../../../../shared/components/notes-list/notes-list.component';
import { AppealInfractionModalComponent } from '../appeal-infraction-modal/appeal-infraction-modal.component';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { RejectInfractionModalComponent } from '../reject-infraction-modal/reject-infraction-modal.component';
import { ApproveInfractionModalComponent } from '../approve-infraction-modal/approve-infraction-modal.component';
import { GetValueByKeyForEnumPipe } from '../../../../../shared/pipes/get-value-by-key-for-status.pipe';

@Component({
  selector: 'app-infraction-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainContainerComponent,
    InfractionClaimListComponent,
    FormsModule,
    InfractionProofListComponent,
    NotesListComponent,
    NgClass,
    GetValueByKeyForEnumPipe,
  ],
  templateUrl: './infraction-detail.component.html',
  styleUrl: './infraction-detail.component.scss',
})
export class InfractionDetailComponent implements OnInit {
  infraction: InfractionResponseDTO | undefined;
  infractionService = inject(InfractionServiceService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);

  private roleService = inject(RoleService);
  infractionId: number | undefined;

  InfractionStatusEnum = InfractionStatusEnum;
  role: string = '';
  userId: number | undefined;
  userPlotsIds: number[] = [];

  activeTab: InfractionTab = 'claims';

  async ngOnInit(): Promise<void> {
    let id;
    this.roleService.currentRole$.subscribe((role: string) => {
      this.role = role;
    });
    this.roleService.currentUserId$.subscribe((userId: number) => {
      this.userId = userId;
    });

    this.roleService.currentLotes$.subscribe((plots: number[]) => {
      this.userPlotsIds = plots;
    });

    this.activatedRoute.params.subscribe(async (params) => {
      const mode = params['mode'];
      id = params['id'];
      this.infractionId = id;
    });

    try {
      const infraction: InfractionResponseDTO | undefined =
        await this.getInfractionById(id!);
    } catch (error) {
      console.error(error);
    }

    this.infractionId = +this.activatedRoute.snapshot.paramMap.get('id')!;
  }

  private async getInfractionById(
    id: number
  ): Promise<InfractionResponseDTO | undefined> {
    const infraction = await firstValueFrom(
      this.infractionService.getInfractionById(id)
    );

    this.infraction = infraction;
    return infraction;
  }

  goBack(): void {
    window.history.back();
  }
  showRejectButton(): boolean {
    return (
      this.role === 'ADMIN' &&
      (this.infraction!.infraction_status ===
        ('APPEALED' as InfractionStatusEnum) ||
        this.infraction!.infraction_status ===
          ('CREATED' as InfractionStatusEnum))
    );
  }

  showAppealButton(): boolean {
    return (
      this.role !== 'ADMIN' &&
      this.infraction!.infraction_status === ('CREATED' as InfractionStatusEnum)
    );
  }

  showApproveButton(): boolean {
    return (
      this.role === 'ADMIN' &&
      this.infraction!.infraction_status ===
        ('APPEALED' as InfractionStatusEnum)
    );
  }

  setActiveTab(tab: InfractionTab): void {
    this.activeTab = tab;
  }

  rejectInfraction() {
    const modalRef = this.modalService.open(RejectInfractionModalComponent);
    modalRef.componentInstance.infractionId = this.infractionId;
    modalRef.result
      .then((result) => {
        if (result) {
          this.getInfractionById(this.infractionId!);
        }
      })
      .catch(() => {});
  }

  approveInfraction() {
    const modalRef = this.modalService.open(ApproveInfractionModalComponent);
    modalRef.componentInstance.infractionId = this.infractionId;
    modalRef.result
      .then((result) => {
        if (result) {
          this.getInfractionById(this.infractionId!);
        }
      })
      .catch(() => {});
  }

  appealInfraction() {
    const modalRef = this.modalService.open(AppealInfractionModalComponent);
    modalRef.componentInstance.infractionId = this.infractionId;
    modalRef.result
      .then((result) => {
        if (result) {
          this.getInfractionById(this.infractionId!);
        }
      })
      .catch(() => {});
  }
}
