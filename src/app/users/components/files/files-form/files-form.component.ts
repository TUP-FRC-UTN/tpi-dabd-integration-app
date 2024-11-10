import { Component, inject, OnInit } from '@angular/core';
import {
  Form,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoadFileService } from '../../../services/load-file.service';
import { OwnerService } from '../../../services/owner.service';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plot } from '../../../models/plot';
import { PlotService } from '../../../services/plot.service';
import { BatchFileType, FileUploadData, FileTypeMap, FileWithTypes, Document, FileTypeDictionary, FileStatusDictionary } from '../../../models/file';
import { plotForOwnerValidator } from '../../../validators/cadastre-plot-for-owner';
import { ConfirmAlertComponent, ToastService } from 'ngx-dabd-grupo01';
import { Owner } from '../../../models/owner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface FileData {
  fileType: BatchFileType;
  name: string | null | undefined;
}


@Component({
  selector: 'app-files-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './files-form.component.html',
  styleUrl: './files-form.component.css',
})
export class FilesFormComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  protected ownerService = inject(OwnerService);
  protected ownerPlotService = inject(OwnerPlotService);
  private fileService = inject(LoadFileService);
  private plotService = inject(PlotService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);



  BatchFileType = BatchFileType;

  selectedFiles: File[] = [];
  isUploading: boolean = false;
  id: string | null = null;
  fileTypeOptions!: any;
  owner!: Owner;
  files: Map<string, File> = new Map();
  
  ownerFiles: FileWithTypes[] = [];
  plotFiles: FileWithTypes[] = [];

  
  fileTypeDictionary = FileTypeDictionary;
  fileStatusDictionary = FileStatusDictionary;
  
  
  // ------------------------- COSAS NUEVAS ---------------

  plots: Plot[] = [];

  dniFrontFile: any;
  dniBackFile: any;

  uploadedFiles: Map<string, Document> = new Map();

  fileTypes: Map<string, string> = new Map();

  filesForm = new FormGroup({
    dniBack: new FormControl('', [Validators.required]),
    dniFront: new FormControl('', [Validators.required]),
    filesInput: new FormArray<FormGroup>([]),
  });

  get filesInput(): FormArray {
    return this.filesForm.controls['filesInput'] as FormArray;
  }

  // Método para agregar un FormControl al FormArray por cada plot
  initializeFilesInput() {
    const filesInputArray = this.filesForm.get('filesInput') as FormArray;
    
    // Por cada plot, agregamos un FormControl al FormArray
    this.plots.forEach(() => {
      filesInputArray.push(new FormControl('', Validators.required));
    });
  }

  

  ngOnInit() {

    
    this.setEnums();

    this.getUserSession();

    this.initializeFilesInput()

    
    
  }

  get getUploadedFiles() {
    return this.uploadedFiles
  }

  getUserSession() {
    const user = sessionStorage.getItem('user');
    console.log("Usuario logueado: ", user);
    if(user) {
      const parsedUser = JSON.parse(user);
      const ownerId = parsedUser.value.owner_id;

      this.getOwnerById(ownerId);
    }
  }



  // METODOS DE BUSQUEDA DE ARCHIVOS PARA OWNER Y PLOTS
  getOwnerById(ownerId: number ) {
    this.ownerService.getOwnerById(ownerId).subscribe({
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
    
    // limpiar el map de uploadFiles por las dudas
    this.uploadedFiles.clear()

    // archivos del lote
    if(this.plots.length > 0) {
      this.plots.forEach(plot => {

        this.plotService.getPlotFilesById(plot.id).subscribe({
          next: (response) => {
            console.log("Plot files: ", response)
            if(response.length > 0) {
              this.uploadedFiles.set("plotFile-"+plot.id, response[0])
            }
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
          
          for(const file of response){
            if(file.fileType == "ID_DOCUMENT_FRONT") {
              this.uploadedFiles.set("dniFront", file)
            } else if(file.fileType == "ID_DOCUMENT_BACK") {
              this.uploadedFiles.set("dniBack", file)
            }
          }
        },
        error: (error) => {
          console.error('Error al obtener archivos del lote:', error);
        },
      });
    }
  }

  // metodo para abrir el archivo en otra ventana
  openFile(url?: string): void {
    window.open(url, '_blank');
  }

  // metodo para solicitar cambio
  requestChange(file: any) {
    console.log("Solicitar cambio ", file)
  }

  openNotes(file?: any) {
    console.log(file.reviewNote)
    const modalRef = this.modalService.open(ConfirmAlertComponent);
      modalRef.componentInstance.alertType = "info";
      modalRef.componentInstance.alertTitle = 'Nota del Archivo de '+ this.translateTable(file.fileType, this.fileTypeDictionary);
      modalRef.componentInstance.alertMessage = file.reviewNote;
  }


  onSubmit() {
    console.log("Archivos para subir. onUpload() ", this.files);
    console.log("Archivos para subir del Owner. onUpload() ", this.ownerFiles);
    console.log("Archivos para subir del Plot. onUpload() ", this.plotFiles);


    if(this.ownerFiles.length == 0 && this.plotFiles.length == 0) {
      this.toastService.sendError('No hay archivos seleccionados');
    } else {
      const modalRef = this.modalService.open(ConfirmAlertComponent);
      modalRef.componentInstance.alertType = "info";
      modalRef.componentInstance.alertTitle = 'Confirmacion';
      modalRef.componentInstance.alertMessage = `Seguro que desea cargar ${this.ownerFiles.length} archivos de DNI y ${this.plotFiles.length} Escrituras?`;

      modalRef.result.then(result => {        
        if (result) {
          console.log("llamar a los metodos del service");

          if(this.owner.id) {
            // archivos del owner (dniFront, dniBack)
            for(const file of this.ownerFiles) {
              
              if(this.uploadedFiles.has(file.id)) {
                // llamar al patch
                const filePut = this.uploadedFiles.get(file.id);
                if(filePut) {
                  this.fileService.updateFile(filePut.id, filePut.fileType, file.file).subscribe({
                    next: (response) => {
                      console.log('Owner Files uploaded successfully:', response);
                      this.isUploading = false;
                    },
                    error: (error) => {
                      console.error('Error uploading files:', error);
                      this.toastService.sendError('Error al cargar los archivos');
                      this.isUploading = false;
                    },
                    complete: () => {
                      console.log('File upload process completed');
                      this.toastService.sendSuccess('Archivos cargados exitosamente.');
                      this.isUploading = false;
                      // this.router.navigate(['/users/owner/list']);
                    },
                  }) // TODO cambiar user-id
                }
              } else {
                // llamar al post
                const fileTypeMap: FileTypeMap = this.createFileTypeMap([file]);
                this.fileService.uploadFilesOwner([file.file], fileTypeMap, this.owner.id).subscribe({
                  next: (response) => {
                    console.log('Owner Files uploaded successfully:', response);
                    this.isUploading = false;
                  },
                  error: (error) => {
                    console.error('Error uploading files:', error);
                    this.toastService.sendError('Error al cargar los archivos');
                    this.isUploading = false;
                  },
                  complete: () => {
                    console.log('File upload process completed');
                    this.toastService.sendSuccess('Archivos cargados exitosamente.');
                    this.isUploading = false;
                    // this.router.navigate(['/users/owner/list']);
                  },
                }) // TODO cambiar user-id
              }
            }
          }

          // archivos del plot ('plotFile'+plot.id)
          for(const file of this.plotFiles) {
            
            if(this.uploadedFiles.has(file.id)) {
              // llamar al patch
              const filePut = this.uploadedFiles.get(file.id);
              if(filePut) {
                this.fileService.updateFile(filePut.id, filePut.fileType, file.file).subscribe({
                  next: (response) => {
                    console.log('Plot Files uploaded successfully:', response);
                    this.isUploading = false;
                  },
                  error: (error) => {
                    console.error('Error uploading files:', error);
                    this.toastService.sendError('Error al cargar los archivos');
                    this.isUploading = false;
                  },
                  complete: () => {
                    console.log('File upload process completed');
                    this.toastService.sendSuccess('Archivos cargados exitosamente.');
                    this.isUploading = false;
                    // this.router.navigate(['/users/owner/list']);
                  },
                }) // TODO cambiar user-id
              }
            } else {
               // llamar al post
               const fileTypeMap: FileTypeMap = this.createFileTypeMap([file]);
               const plotId = parseInt(file.id.split('-')[1]);

               this.fileService.uploadFilesOwner([file.file], fileTypeMap, plotId).subscribe({
                next: (response) => {
                  console.log('Plot Files uploaded successfully:', response);
                  this.isUploading = false;
                },
                error: (error) => {
                  console.error('Error uploading files:', error);
                  this.toastService.sendError('Error al cargar los archivos');
                  this.isUploading = false;
                },
                complete: () => {
                  console.log('File upload process completed');
                  this.toastService.sendSuccess('Archivos cargados exitosamente.');
                  this.isUploading = false;
                  // this.router.navigate(['/users/owner/list']);
                },
              }) // TODO cambiar user-id
            }
          }



        } else {
          this.toastService.sendError('operacion cancelada'); // aca no entra nunca
        }
      })
    }



    // this.onUploadNacho();
  }

  /**
   * Triggered when the user selects a file from the file input.
   *
   * @param event The file input event containing the selected file.
   */
   onFileSelectedOwner(event: Event, controlName: string, fType: BatchFileType): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const renamedFile: File = this.renameFileIfNeeded(target.files[0]);
      this.ownerFiles.push({
        id: controlName,
        file: renamedFile,
        type: fType
      });
    } else {
      this.ownerFiles.filter(file => file.id != controlName);
    }
    console.log("Files del owner: ", this.ownerFiles);
  }

  onFileSelectedPlot(event: Event, controlName: string): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const renamedFile: File = this.renameFileIfNeeded(target.files[0]);
      this.plotFiles.push({
        id: controlName,
        file: renamedFile,
        type: BatchFileType.PURCHASE_SALE
      });
    } else {
      this.plotFiles.filter(file => file.id != controlName);
    }
    console.log("Files del plot: ", this.plotFiles);
  }


  renameFileIfNeeded(originalFile: File): File {
    let counter = 0;
    let newFileName = originalFile.name;
    console.log("Entro a renombrado");
    while(this.isFileNameInMap(newFileName)) {
      console.log("Colision");
      newFileName = counter + originalFile.name;
      counter++;
    }
    return new File([originalFile], newFileName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }


  // TODO
  // modificar para que entre a revisar en las dos listas -------------------------------------------------
  private isFileNameInMap(fileName: string): boolean {
    for (const file of this.files.values()) {
      if (file.name === fileName) {
        return true;
      }
    }
    return false;
  }


  /* onUploadNacho(): void {

    // valido que haya al menos tres archivos (2 dni y 1 lote)
    console.log("fileTypes.size: ", this.fileTypes.size);

    if (!this.files.get('dniFront') || !this.files.get('dniBack')) {
      this.toastService.sendError('No hay archivos de dni cargados');
      return;
    } else if (this.files.size < 3) {
      this.toastService.sendError('Agregue por lo menos un lote y cargue un archivo');
      return;
    } else if (this.fileTypes.size == 0) {
      this.toastService.sendError('Seleccione un tipo de archivo de lote a cargar');
      return;
    }

    // hablar con nacho para entender bien este método


    const fileTypeMap: FileTypeMap = this.createFileTypeMap();
    this.fileService
      .uploadFilesNacho(this.getSelectedFiles(), fileTypeMap, 1, 1)
      .subscribe({
        next: (response) => {
          console.log('Files uploaded successfully:', response);
          this.isUploading = false;
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.toastService.sendError('Error al cargar los archivos');
          this.isUploading = false;
        },
        complete: () => {
          console.log('File upload process completed');
          this.toastService.sendSuccess('Archivos cargados exitosamente.');
          this.isUploading = false;
          this.router.navigate(['/users/owner/list']);
        },
      });
  } */

  private createFileTypeMap(filesWT: FileWithTypes[]) {
    const typeMap: { [key: string]: string } = {};
    
    for(const fwt of filesWT) {
      typeMap[fwt.file.name] = fwt.type;
    }
    
    return { type_map: typeMap } as FileTypeMap;
  }

  private getSelectedFiles(): File[] {
    const filteredFiles: File[] = [];
    this.files.forEach((file, controlName) => filteredFiles.push(file));
    return filteredFiles;
  }

  /**
   * Collects and structures the form data into a single object,
   * including files and details for each plot input.
   */
  /* getFormData(): FormData {
    const formData: FormData = {
      fileTypeFront: this.filesForm.value.fileTypeFront,
      nameFront: this.filesForm.value.nameFront,
      fileTypeBack: this.filesForm.value.fileTypeBack,
      nameBack: this.filesForm.value.nameBack,
      files: [],
    };
    console.log("AAAAAAAAAAA", this.filesInput)
    this.filesInput.controls.forEach((control) => {
      const fileData = {
        fileType: control.value.fileType,
        name: control.value.name,
      };

      formData.files.push(fileData);
    });
    return formData;
  } */




  /**
   * Constructs an array of FileUploadData objects from a FormData object.
   *
   * This function transforms the structured data from FormData, including
   * each file's type and details, into an array format that can be used
   * for the upload service. It handles both front and back ID files and
   * any additional plot-related files included in the form.
   *
   * @param formData - The structured form data containing main files,
   *                   such as front and back IDs, and plot-specific files.
   * @returns An array of FileUploadData objects, each containing a file
   *          and its associated type for upload.
   */
 /*  buildFileUploadData(formData: FormData, selectedFiles: File[]): FileUploadData[] {
    const fileUploadData: FileUploadData[] = [];
    if (formData.nameFront && formData.fileTypeFront) {
      fileUploadData.push({
        file: selectedFiles[0],
        fileType: formData.fileTypeFront,
        fileName: formData.nameFront
      });
    }
    if (formData.nameBack && formData.fileTypeBack) {
      fileUploadData.push({
        file: selectedFiles[1],
        fileType: formData.fileTypeBack,
        fileName: formData.nameBack
      });
    }
    formData.files.forEach((fileData, i) => {
      if (fileData.name && fileData.fileType) {
        fileUploadData.push({
          file: selectedFiles[i + 2],
          fileType: fileData.fileType,
          fileName: fileData.name
        });
      }
    });
    return fileUploadData;
  } */


  // no esta en la nueva implementacion para carga de archivos
  setEnums() {
    this.fileTypeOptions = Object.entries(BatchFileType).map(
      ([key, value]) => ({
        value: key,
        display: value,
      })
    );
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

}
