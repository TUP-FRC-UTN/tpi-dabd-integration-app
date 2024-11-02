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


  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  totalItems: number = 0;
  // filteredFilesList: ValidateOwner[] = [];
  applyFilterWithInput!: boolean;
  filterInput!: any;

  // lista de archivos del owner
  files: any[] = [];

  // owner id de los params
  id: string | null = null;
  owner: Owner | null = null;

  fileTypeDictionary = FileTypeDictionary;
  fileStatusDictionary = FileStatusDictionary;




  protected ownerService = inject(OwnerService);
  // protected fileService = inject(FileService);
  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute);


  @ViewChild('confirmAlertContentTemplate')
  confirmAlertContentTemplate!: TemplateRef<any>;

  noteForm = new FormGroup({
    note: new FormControl('', [Validators.required])
  });


  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('ownerId');
    if(this.id) {
      this.getOwnerAndFilesById(this.id);
    }
  }

  getOwnerAndFilesById(ownerId: string ) {
    const id = parseInt(ownerId, 10);
    combineLatest([
      this.ownerService.getOwnerById(id),
      this.ownerService.getOwnerFilesById(id),
    ]).subscribe({
      next: ([owner, files]) => {
        this.owner = owner;
        this.files = files;
      },
      error: (error) => {
        console.error('Error al obtener propietario y archivos:', error);
      },
    });
    /* this.ownerService.getOwnerById(parseInt(id, 10)).subscribe({
      next: (response) => {
        this.owner = response;
      },
      error: (error) => {
        console.error("Error al obtener propietarios:", error);
      }
    });
    this.ownerService.getOwnerFilesById(parseInt(id)).subscribe({
      next: (response) => {
        this.files = response;
      },
      error: (error) => {
        console.error('Error al obtener owners files:', error);
      },
    }); */
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
            console
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
    if (this.id) {
      this.getOwnerAndFilesById(this.id);
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.id) {
      this.getOwnerAndFilesById(this.id);
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
