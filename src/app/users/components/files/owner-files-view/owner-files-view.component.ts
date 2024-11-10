import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { OwnerService } from '../../../services/owner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ConfirmAlertComponent, ToastService, MainContainerComponent, FormFieldsComponent, FormConfig } from 'ngx-dabd-grupo01';
import { Document, FileStatusDictionary, FileTypeDictionary } from '../../../models/file';
import { DocumentTypeDictionary, Owner, StateKYC } from '../../../models/owner';
import { FileService } from '../../../services/file.service';
import { combineLatest } from 'rxjs';
import { PlotService } from '../../../services/plot.service';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { InfoComponent } from '../../commons/info/info.component';


@Component({
  selector: 'app-owner-files-view',
  standalone: true,
  imports: [NgbPagination, FormsModule, MainContainerComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './owner-files-view.component.html',
  styleUrl: './owner-files-view.component.css'
})
export class OwnerFilesViewComponent {

  private fileService = inject(FileService);
  private modalService = inject(NgbModal);
  private location = inject(Location);
  protected ownerService = inject(OwnerService);
  private plotService = inject(PlotService);
  // protected fileService = inject(FileService);
  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute);
  
  private toastService = inject(ToastService)

  private ownerPlotService = inject(OwnerPlotService);


  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  totalItems: number = 0;
  // filteredFilesList: ValidateOwner[] = [];
  applyFilterWithInput!: boolean;
  filterInput!: any;

  // boolean para saber si puede aprobar el KYC del owner
  canApproveOwner: boolean = false;

  // lista de archivos del owner
  files: any[] = [];

  // lista de archivos del plot
  plotFiles: any[] = [];

  // owner id de los params
  id: string | null = null;

  owner!: Owner;

  // lista de plots del owner
  plots: any[] = [];


  fileTypeDictionary = FileTypeDictionary;
  fileStatusDictionary = FileStatusDictionary;
  documentTypeDictionary = DocumentTypeDictionary;




  @ViewChild('confirmAlertContentTemplate')
  confirmAlertContentTemplate!: TemplateRef<any>;

  noteForm = new FormGroup({
    note: new FormControl('', [Validators.required])
  });


  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('ownerId');
    if(this.id) {
      this.getOwnerById(this.id);
    }
    console.log("files length ", this.files.length)

    this.canApproveOwner = this.areAllApproved();
    
    
    // ---------------------------------
    // descomentar estas lineas si se necesita algo mockeado
    // mock
    /* this.callMock();
    
    this.canApproveOwner = this.areAllApproved();
    console.log(this.canApproveOwner) */
    // ------------------------------------

  }

  getOwnerById(ownerId: string ) {
    const id = parseInt(ownerId, 10);
    this.ownerService.getOwnerById(id).subscribe({
      next: (response) => {
        this.owner = response;
        this.getOwnerPlots();
      },
      error: (error) => {
        console.error('Error al obtener propietario: ', error);
      },
    });
  }

  getOwnerPlots() {
    if(this.owner.id) {
      this.ownerPlotService.giveAllPlotsByOwner(this.owner.id, 0, 1000).subscribe({
        next: (response) => {
          console.log("AAAAAAAAAAA", response.content)
          this.plots = response.content;
          this.getAllFiles(this.owner)
        },
        error: (error) => {
          console.error('Error al obtener archivos del lote:', error);
        },
      })
    }
  }

  getAllFiles(owner: Owner) {
    // archivos del lote
    if(this.plots.length > 0) {
      this.plots.forEach(plot => {

        this.plotService.getPlotFilesById(plot.id).subscribe({
          next: (response) => {
            console.log("Plot files: ", response)
            this.plotFiles.push(response[0]);
          },
          error: (error) => {
            console.error('Error al obtener archivos del lote:', error);
          },
        });

      })
    }
    // archivos del owner
    if(owner.id) {
      this.ownerService.getOwnerFilesById(owner.id).subscribe({
        next: (response) => {
          console.log("RESP DE GETOWNERFILES", response)
          this.files = response;
          console.log("FILES DE ", this.files)
          this.plotFiles.forEach(file => {
            this.files.push(file);
          })
          this.canApproveOwner = this.areAllApproved();
        },
        error: (error) => {
          console.error('Error al obtener archivos del lote:', error);
        },
      });
    }

    

    console.log("plots: ", this.plots);
    console.log("files: ", this.files);
  }

  // metodo para abrir el archivo en otra ventana
  openFile(url: string): void {
    window.open(url, '_blank');
  }

  // metodo para aprobar archivos del owner
  changeFileStatus(file: any, status: string) {

    const modalRef = this.modalService.open(ConfirmAlertComponent)
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = `¿Está seguro de que desea cambiar el estado a ${this.translateTable(status, this.fileStatusDictionary)}?`;
    modalRef.componentInstance.alertType = 'warning';

    modalRef.componentInstance.content = this.confirmAlertContentTemplate;

    modalRef.componentInstance.onConfirm = () => {
      if(this.noteForm.valid) {
        console.log(this.noteForm.value.note)
        this.fileService.updateFileStatus(file.id, status, this.noteForm.value.note, '1').subscribe({
          next: (response) => {
            console.log(response);
            this.toastService.sendSuccess('Estado cambiado correctamente.')
            this.getAllFiles(this.owner);
          },
          error: (error) => {
            console.error('Error al aprobar el file:', error);
            this.toastService.sendError('Error al cambiar el estado.')
          },
        })
        modalRef.close();
        this.noteForm.reset();
      } else {
        console.log("HOLA")
        this.noteForm.markAllAsTouched();
      }

    };
  }

  // metodo para verificar el estado de todos los archivos
  areAllApproved(): boolean {
    let result = true;
    if(this.files.length > 0) {
      this.files.forEach((file) => {
        console.log("status: ", file.approvalStatus)
        if(file.approvalStatus !== 'APPROVED') {
          result = false;
        }
      })
    } else {
      result = false;
    }
    return result;
  }

  // metodo para aprobar el KYC completo de un owner
  approveOwner() {
    if(this.areAllApproved()) {
      console.log("aprobar KYC del owner ", this.owner);

      const modalRef = this.modalService.open(ConfirmAlertComponent)
      modalRef.componentInstance.alertTitle = 'Confirmación';
      modalRef.componentInstance.alertMessage = `¿Está seguro de que desea Aprobar al propietario ${this.owner?.firstName} ${this.owner?.lastName}
                                                con ${this.translateTable(this.owner?.documentType, this.documentTypeDictionary)} ${this.owner?.documentNumber}`;
      modalRef.componentInstance.alertType = 'warning';
      modalRef.componentInstance.onConfirm = () => {
        console.log("Aca le pego al back para actualizar el estado del owner");
        if(this.owner.id) {
          console.log(this.plots)
          this.ownerService.validateOwner(this.owner.id, this.plots[0].id, "VALIDATED", '1').subscribe({
            next: (response) => {
              console.log(response);
              this.toastService.sendSuccess('Propietario validado correctamente');
              this.getAllFiles(this.owner);
            },
            error: (error) => {
              console.error('Error al aprobar el KYC del owner:', error);
              this.toastService.sendError('No se pudo validar el propietario');
            },
          })
          modalRef.close();
        }
      }
    } else {
      this.toastService.sendError('Todos los archivos deben estar aprobados');
    }
  }

  getFormConfig(): FormConfig {
    return {
      fields: [
        { name: 'note', label: 'Nota', type:'textarea'}
      ]
    }
  }

  translateTable(value: any, dictionary: { [key: string]: any }) {
    if (value !== undefined && value !== null) {
      for (const key in dictionary) {
        if (dictionary[key] === value) {
          return key;
        }
      }
    }
    return;
  }

  // metodo para rechazar archivos del owner
  rejectFile(file: any) {
    console.log("rechazar archivo", file);
  }


  plotDetail(plotId : number) {
    this.router.navigate([`/users/plot/detail/${plotId}`])
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    if (this.owner) {
      this.getAllFiles(this.owner);
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.owner) {
      this.getAllFiles(this.owner);
    }
  }



  goBack() {
    this.location.back()
  }

  toggleView(type: string){}
  applyFilter(type: string){}
  clearFilters(){}
  confirmFilter(){}

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

  }


  callMock() {
    this.files = [
      {
          id: 1,
          fileType: "ID_DOCUMENT_BACK",
          name: "Contract Document",
          contentType: "application/pdf",
          url: "https://example.com/documents/contract.pdf",
          approvalStatus: "APPROVED",
          reviewNote: "Reviewed and approved.",
          isActive: true
      },
      {
          id: 2,
          fileType: "ID_DOCUMENT_FRONT",
          name: "Passport ",
          contentType: "image/jpeg",
          url: "https://example.com/documents/passport.jpg",
          approvalStatus: "APPROVED",
          reviewNote: "Awaiting review.",
          isActive: true
      }
    ];

    this.plotFiles = [
      {
        id: 3,
        fileType: "PURCHASE_SALE",
        name: "Resume",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "https://example.com/documents/resume.docx",
        approvalStatus: "UPLOADED",
        reviewNote: "Please update with recent experience.",
        isActive: false
      }
    ];

    this.plotFiles.forEach(file => {
      this.files.push(file);
    });

    this.owner = {
      id: 1,
      firstName: "John",
      secondName: "Michael",
      lastName: "Doe",
      ownerType: "person",
      documentNumber: "12345678",
      documentType: "P",
      cuit: "20-12345678-9",
      bankAccount: "123-456-789",
      birthdate: "1985-04-23",
      kycStatus: StateKYC.INITIATED,  // assuming StateKYC is a string or appropriate enum
      isActive: true,
      contacts: [],  // Assuming contacts are optional or can be empty
      plotId: 101,
      addresses: []  // Empty array since no addresses are provided
  };
  }

}
