import { Component, ElementRef, Inject, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { TemplateService } from '../../../services/template.service';
import { AbstractControl, FormsModule, NgForm, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TemplateModel } from '../../../models/templates/templateModel';
import { HttpErrorResponse } from '@angular/common/http';
import { IaService } from '../../../services/ia-service';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-template-email',
  standalone: true,
  imports: [FormsModule, CommonModule,MainContainerComponent],
  templateUrl: './template-email.component.html',
  styleUrl: './template-email.component.css',
})
@Inject('TemplateService')
@Inject('HtmlValidationService')
@Inject('IaService')
export class TemplateEmailComponent {
  templateName: string = '';
  templateBody: string = '';
  modalTitle: string = '';
  modalMessage: string = '';
  isModalOpen = false;
  isIaModalOpen = false;
  iaInputText = '';
  iaResponse: String = '';
  isLoadingIA: boolean = false;
  previewVisible: boolean = false;
  showModalToRenderHTML: boolean = false;
  @ViewChild('iframePreview') iframePreview!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }


  template: TemplateModel = {
    id: 0,
    name: '',
    body: '',
    active: true
  };

  templateService: TemplateService = new TemplateService();
  toastService: ToastService = inject(ToastService);
  iaService: IaService = new IaService();

  public async sendForm(form: NgForm) {
    // Agrega el validador a templateBody
    const templateBodyControl = form.controls['templateBodyModel'];
    templateBodyControl.setValidators([this.isValidHTML()]);
    templateBodyControl.updateValueAndValidity();

    if (form.valid) {
       await this.sendEmailTemplate(
        form.value.templateNameModel,
        form.value.templateBodyModel
        
      );
      form.reset();
     // templateBodyControl.markAsPristine();
    }
   // form.form.markAsPristine();
    //form.form.markAsUntouched();
    //Object.values(this.form.controls).forEach
    //podría ir un form.resetForm acá
  }

  async sendEmailTemplate(templateName: string, templateBody: string) {

    this.template.name = templateName;
    this.template.body = templateBody;

    this.templateService.sendTemplate(this.template).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("Plantilla guardada correctamente")
       
      },
      error: (error: HttpErrorResponse) => {
         this.toastService.sendError("Hubo un error guardando la plantilla");
        console.error('Error al enviar el template:', error);
      },
    });
  }

  openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isModalOpen = true;
    document.body.classList.add('modal-open');
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  private resetForm() {
    this.templateName = '';
    this.templateBody = '';
  }
  isValidHTML(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const html = control.value;

      if (!html) {
        return null; // No hay valor, no se aplica la validación
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const isValid = !doc.getElementsByTagName('parsererror').length; // Verifica si hay errores

      return isValid ? null : { invalidHtml: true }; // Retorna un objeto de error si es inválido
    };
  }

    openIaModal() {
      this.isIaModalOpen = true;
    }

    closeIaModal() {
      this.isIaModalOpen = false;
    }


    sendToIa() {
      this.isLoadingIA = true;
      this.iaService.askTemplateToAI(this.iaInputText).subscribe({
        next: (response) => {
          this.iaResponse = response;
          this.isLoadingIA = false;
        },
        error: (error) => {
          console.error("Error de IA:", error);
          this.toastService.sendError(error);
          this.isLoadingIA = false;
        }
      });
    }

    sendBodyIa(){
      this.templateBody = this.iaResponse.toString();
      this.closeIaModal();
    }

    openPreviewModal() {
      if (this.isValidHtml(this.iaResponse.toString())) {
        this.previewVisible = true;
      } else {
        this.toastService.sendError("El HTML no es válido para la previsualización.");
      }
    }

    isValidHtml(html: string): boolean {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return !doc.getElementsByTagName('parsererror').length;
    }

    previewContent(): void {
      this.showModalToRenderHTML = true;
      setTimeout(() => {
        const iframe = this.iframePreview.nativeElement as HTMLIFrameElement;
        iframe.srcdoc = this.iaResponse.toString(); // Asigna la respuesta de la IA al iframe
        iframe.onload = () => {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            const height = iframeDocument.documentElement.scrollHeight;
            iframe.style.height = `${height}px`; // Ajusta la altura del iframe
          }
        };
      }, 5);
    }

    closeModalToRenderHTML(): void {
      this.showModalToRenderHTML = false;
    }

    showInfo() {
      const message = '';

      this.showModal('Información', message);
    }

    showModal(title: string, message: string) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.isModalOpen = true;
    }

   


}
