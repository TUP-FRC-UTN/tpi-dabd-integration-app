import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { OwnerService } from '../../../services/owner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ConfirmAlertComponent, ToastService, MainContainerComponent, FormFieldsComponent, FormConfig } from 'ngx-dabd-grupo01';
import { Document, FileStatusDictionary, FileTypeDictionary } from '../../../models/file';
import { Owner } from '../../../models/owner';
import { FileService } from '../../../services/file.service';
import { combineLatest } from 'rxjs';
import { PlotService } from '../../../services/plot.service';


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


  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  totalItems: number = 0;
  // filteredFilesList: ValidateOwner[] = [];
  applyFilterWithInput!: boolean;
  filterInput!: any;

  // lista de archivos del owner
  files: any[] = [];

  // lista de archivos del plot
  plotFiles: any[] = [];

  // owner id de los params
  id: string | null = null;

  owner!: Owner;

  fileTypeDictionary = FileTypeDictionary;
  fileStatusDictionary = FileStatusDictionary;




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
    if(this.owner) {
      this.getAllFiles(this.owner);
    }

    this.files.push(this.plotFiles);
  }

  getOwnerById(ownerId: string ) {
    const id = parseInt(ownerId, 10);
    this.ownerService.getOwnerById(id).subscribe({
      next: (response) => {
        this.owner = response;
      },
      error: (error) => {
        console.error('Error al obtener propietario: ', error);
      },
    });
  }

  getAllFiles(owner: Owner) {
    if(owner.plotId) {
      this.plotService.getPlotFilesById(owner.plotId).subscribe({
        next: (response) => {
          this.plotFiles = response;
        },
        error: (error) => {
          console.error('Error al obtener archivos del lote:', error);
        },
      });
    }
    if(owner.id) {
      this.ownerService.getOwnerFilesById(owner.id).subscribe({
        next: (response) => {
          this.files = response;
        },
        error: (error) => {
          console.error('Error al obtener archivos del lote:', error);
        },
      });
    }
    this.files.push(this.plotFiles);
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
            this.getAllFiles(this.owner);
          },
          error: (error) => {
            console.error('Error al aprobar el file:', error);
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
    this.router.navigate([`/plot/detail/${plotId}`])
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

}
