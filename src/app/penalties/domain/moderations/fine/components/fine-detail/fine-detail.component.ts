import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fine } from '../../models/fine.model';
import { FineStatusEnum } from '../../models/fine-status.enum';
import { FineService } from '../../services/fine.service';
import { UpdateFineStateDTO } from '../../models/update-fine-status-dto';
import {
  ConfirmAlertComponent,
  MainContainerComponent,
  ToastService,
} from 'ngx-dabd-grupo01';
import { PdfService } from '../../../../../shared/services/pdf.service';
import { RoleService } from '../../../../../shared/services/role.service';
import { FineInfractionsListComponent } from '../fine-infractions-list/fine-infractions-list.component';
import { GetValueByKeyForEnumPipe } from '../../../../../shared/pipes/get-value-by-key-for-status.pipe';
import { firstValueFrom } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-fine-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainContainerComponent,
    FineInfractionsListComponent,
    GetValueByKeyForEnumPipe,
  ],
  templateUrl: './fine-detail.component.html',
  styleUrl: './fine-detail.component.scss',
})
export class FineDetailComponent {
  FineStatusEnum = FineStatusEnum;
  fineService = inject(FineService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private roleService = inject(RoleService);
  private toastService = inject(ToastService);
  modalService = inject(NgbModal);
  fineId: number | undefined;
  fine: Fine | undefined;
  initialState: FineStatusEnum | undefined;
  isAdminAndOnAssembly: boolean = false;

  error: string | null = null;
  successMessage: string | null = null;
  role: string = '';
  userId: number | undefined;
  userPlotsIds: number[] = [];

  async ngOnInit() {
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
    this.route.params.subscribe(async (params) => {
      const mode = params['mode'];
      id = params['id'];
      this.fineId = id;
    });

    try {
      const fine: Fine | undefined = await this.getFineById(id!);
      console.log(
        fine!.fine_state,
        'ON_ASSEMBLY' as FineStatusEnum,
        FineStatusEnum.ON_ASSEMBLY
      );

      this.isAdminAndOnAssembly =
        this.role === 'ADMIN' &&
        fine!.fine_state === ('ON_ASSEMBLY' as FineStatusEnum);
    } catch (error) {
      console.error(error);
    }

    this.fineId = +this.route.snapshot.paramMap.get('id')!;
  }

  private async getFineById(fineId: number): Promise<Fine | undefined> {
    const fine = await firstValueFrom(this.fineService.getFineById(fineId));
    this.fine = fine;
    return fine;
  }

  viewInfractionDetail(arg0: number) {
    throw new Error('Method not implemented.');
  }

  save(fineStatus: FineStatusEnum) {
    let fine: UpdateFineStateDTO = {
      id: this.fine?.id,
      updatedBy: this.userId!,
      fineState: fineStatus,
    };

    this.fineService.updateState(fine).subscribe({
      next: (response) => {
        this.toastService.sendSuccess('Se actualizó el estado con éxito.');
        this.ngOnInit();
      },
      error: (error) => {
        this.toastService.sendError('Sucedió un error actualizando la multa.');
      },
    });
  }

  changeFineStatus(fineStatus: string) {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = `¿Estás seguro de que desea modificar la multa?`;

    modalRef.result.then((result) => {
      if (result) {
        this.save(fineStatus as FineStatusEnum);
      }
    });
  }

  goBack = (): void => {
    window.history.back();
  };
}
