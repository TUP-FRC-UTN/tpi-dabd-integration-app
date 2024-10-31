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
import { BatchFileType, FileUploadData } from '../../../models/file';
import { plotForOwnerValidator } from '../../../validators/cadastre-plot-for-owner';
import { ToastService } from 'ngx-dabd-grupo01';
import { Owner } from '../../../models/owner';

interface FileData {
  fileType: BatchFileType;
  name: string | null | undefined;
}

interface FormData {
  fileTypeFront: string | null | undefined;
  nameFront: string | null | undefined;
  fileTypeBack: string | null | undefined;
  nameBack: string | null | undefined;
  files: FileData[];
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

  selectedFiles: File[] = [];
  isUploading: boolean = false;
  id: string | null = null;
  plots: Plot[] = [];
  fileTypeOptions!: any;
  owner!: Owner;

  filesForm = new FormGroup({
    dniBack: new FormControl('', [Validators.required]),
    dniFront: new FormControl('', [Validators.required]),
    fileTypeFront: new FormControl('', [Validators.required]),
    nameFront: new FormControl('', [Validators.required]),
    contentTypeFront: new FormControl('', [Validators.required]),
    fileTypeBack: new FormControl('', [Validators.required]),
    nameBack: new FormControl('', [Validators.required]),
    contentTypeBack: new FormControl('', [Validators.required]),
    filesInput: new FormArray<FormGroup>([]),
  });

  get filesInput(): FormArray {
    return this.filesForm.controls['filesInput'] as FormArray;
  }

  addFilesInput() {
    const fileInput = new FormGroup({
      blockNumber: new FormControl('', [Validators.required]),
      plotNumber: new FormControl(
        '',
        [Validators.required],
        [plotForOwnerValidator(this.plotService)]
      ),
      plotFile: new FormControl('', [Validators.required]),
      fileType: new FormControl('', [Validators.required]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
    });

    this.filesInput.push(fileInput);
  }

  removeFileInput(index: number) {
    this.filesInput.removeAt(index);
  }

  ngOnInit() {
    this.setEnums();
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.ownerService.getOwnerById(parseInt(this.id, 10)).subscribe({
        next: (response) => {
          this.owner = response;
        },
        error: (error) => {
          console.error('Error al obtener owners:', error);
        },
      });
    }
  }

  onSubmit() {
    this.onUpload();
  }

  /**
   * Triggered when the user selects a file from the file input.
   *
   * @param event The file input event containing the selected file.
   */
  onFileSelected(event: Event, control: string): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFiles = [...this.selectedFiles].concat(Array.from(target.files));
    }
  }
    

  /**
   * Upload the selected file to the server using the FileUploadService.
   */
  onUpload(): void {
    if (this.selectedFiles.length > 0) {
      this.isUploading = true;
      const formData = this.getFormData();
      const fileUploadData = this.buildFileUploadData(formData, this.selectedFiles);
      if (true) {
        this.fileService
          .uploadFiles(1, 1, fileUploadData) // mock owner and user ids
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
              this.router.navigate(['/owner/list']);
            },
          });
      }
    } else {
      console.log('No files selected for upload.');
      this.toastService.sendError('No hay archivos seleccionados para cargar');
    }
  }

  /**
   * Collects and structures the form data into a single object,
   * including files and details for each plot input.
   */
  getFormData(): FormData {
    const formData: FormData = {
      fileTypeFront: this.filesForm.value.fileTypeFront,
      nameFront: this.filesForm.value.nameFront,
      fileTypeBack: this.filesForm.value.fileTypeBack,
      nameBack: this.filesForm.value.nameBack,
      files: [],
    };
    this.filesInput.controls.forEach((control) => {
      const fileData = {
        fileType: control.value.fileType,
        name: control.value.name,
      };
      
      formData.files.push(fileData);
    });
    return formData;
  }

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
  buildFileUploadData(formData: FormData, selectedFiles: File[]): FileUploadData[] {
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
  }

  setEnums() {
    this.fileTypeOptions = Object.entries(BatchFileType).map(
      ([key, value]) => ({
        value: key,
        display: value,
      })
    );
  }
}
