// import { Component, Inject, OnInit, inject } from '@angular/core';
// import { TemplateSercv } from '../../../app/services/email-service.service';
// import { FormsModule, NgForm } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';
// import { TemplateModelResponse } from '../../../app/models/templateModelResponse';
// import { HttpErrorResponse } from '@angular/common/http';

// @Component({
//   selector: 'app-template-edition',
//   standalone: true,
//   imports: [FormsModule, CommonModule],
//   templateUrl: './template-edition.component.html',
//   styleUrl: './template-edition.component.css',
// })
// @Inject('EmailServiceService')
// export class TemplateEditionComponent /*implements OnInit*/ {
//   templateName: string = '';
//   templateBody: string = '';
//   modalTitle: string = '';
//   modalMessage: string = '';
//   isModalOpen = false;
//   templateId: any = '';
//   template: TemplateModelResponse = new TemplateModelResponse();

//   private readonly router = inject(ActivatedRoute);

//   emailService: EmailServiceService = new EmailServiceService();

//   ngOnInit() {
//     this.templateId = this.router.snapshot.paramMap.get('id');

//     this.emailService.getEmailTemplates().subscribe(
//       (data: TemplateModelResponse[]) => {
//         this.templateName =
//           data.find((x) => x.id === this.templateId)?.name || '';
//       },
//       (error) => {
//         console.error('Error al obtener los templates:', error);
//       }
//     );
//   }

//   public async sendForm(form: NgForm) {
//     if (form.valid) {
//       this.editEmailTemplate(
//         form.value.templateBodyName != undefined
//           ? form.value.templateBodyName
//           : this.templateName,
//         form.value.templateBodyModel
//       );
//     }
//   }

//   editEmailTemplate(templateName: string, templateBody: string) {
//     this.template.id = this.templateId;
//     this.template.name = templateName;
//     this.template.base64body = templateBody;
  // editEmailTemplate(templateName: string, templateBody: string) {
  //   this.template.id = this.templateId;
  //   this.template.name = templateName;
  //   this.template.body = templateBody;

//     this.emailService.editEmailTemplate(this.template).subscribe({
//       next: (response) => {
//         this.openModal(
//           'Exito',
//           'El template se ha editado de manera correcta.'
//         );
//         this.resetForm();
//       },
//       error: (error: HttpErrorResponse) => {
//         this.openModal(
//           'Error',
//           'Hubo un problema al guardar el template. Por favor, intente nuevamente.'
//         );

//         console.error(
//           'Error',
//           'Ha ocurrido un error intentar nuevamente.',
//           error
//         );
//       },
//     });
//   }

//   openModal(title: string, message: string) {
//     this.modalTitle = title;
//     this.modalMessage = message;
//     this.isModalOpen = true;
//     document.body.classList.add('modal-open');
//   }

//   closeModal() {
//     this.isModalOpen = false;
//     document.body.classList.remove('modal-open');
//   }

//   private resetForm() {
//     this.templateName = '';
//     this.templateBody = '';
//   }
// }
