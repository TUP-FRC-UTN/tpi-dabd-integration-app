import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Router } from '@angular/router';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { ToastService } from 'ngx-dabd-grupo01';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateModel } from '../../../models/templates/templateModel';
import { Base64Service } from '../../../services/base64-service.service';
import { TemplateService } from '../../../services/template.service';


@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    RouterModule,
    NgbPagination,
    NgbDropdownModule,
    MainContainerComponent],
  templateUrl: './template-list.component.html',
  styleUrl: './template-list.component.css',
})
@Inject('TemplateService')
@Inject('Base64Service')
export class TemplateListComponent implements OnInit {

  private router = inject(Router);
  private toastService = inject(ToastService);


  templateService = new TemplateService();

  base64Service: Base64Service = new Base64Service();



  @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;


  templates: TemplateModel[] = [];

  mocktemplates : TemplateModel[] = [

  ];
  selectedIndex: number | null = null;
  showModalToRenderHTML: boolean = false;

  ngOnInit(): void {
    this.getEmailTemplates();
  }


  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sizeOptions: number[] = [10, 25, 50];

  // Filtros
  searchTerm = '';
  isActivetemplateFilter: boolean | undefined = true;
  selectedtemplateType: string = '';

  // Estados de modales
  isModalOpen = false;
  //isPreviewModalOpen = false
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  modalTitle = '';
  modalMessage = '';
  isDetailModalOpen = false;
  selectedTemplate: TemplateModel | null = null;

  // Referencias
  @ViewChild('editForm') editForm!: NgForm;
  templateToDelete: TemplateModel = {
    id: 0,
    name: '',
    body: '',
    active: true
  };
  editingtemplate: TemplateModel = this.getEmptytemplate();
  templateToPreview: TemplateModel = {
    id: 0,
    name: '',
    body: '',
    active: true
  };

  //Estado de filtors
  showInput: boolean = false;

  constructor() {
    this.initializePagination();
  }

  private getEmptytemplate(): TemplateModel {
    return {
      id: 0,
      name: '',
      body: '',
      active: true,
    };
  }

  filterByStatus(status: 'all' | 'active' | 'inactive') {
    if (status === 'all') {
      this.isActivetemplateFilter = undefined;
      this.templates = this.mocktemplates
    }
    else if (status === 'active') {
      this.isActivetemplateFilter = true;
      this.templates = this.templates.filter(t => t.active == true)
    }
    else if (status === 'inactive') {
      this.isActivetemplateFilter = false;
      this.templates = this.templates.filter(t => t.active == false)
    }
    this.getEmailTemplates();
  }
  filterByName() {
    this.templates = this.templates.filter(t => t.name.toUpperCase() === this.searchTerm.toUpperCase())
    /*this.emailService.getEmailTemplates().subscribe(data => {
      this.templates = data.filter(template => template.name === this.searchTerm)
    })*/
    this.showInput = false
  }

  // Paginación
  initializePagination() {
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.templates.length;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.getEmailTemplates();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.getEmailTemplates();
  }

  // Modal handlers
  showModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openPreviewModal(template: TemplateModel) {
    this.templateToPreview = { ...template };
    this.previewContent(this.templateToPreview)
  }

  openEditModal(template: TemplateModel) {
    this.editingtemplate = { ...template };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingtemplate = {
      id: 0,
      name: '',
      body: '',
      active: true,
    };
  }

  openDetailModal(template: TemplateModel) {
    if (template) {
      this.selectedTemplate = { ...template };
      this.isDetailModalOpen = true;
    }
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedTemplate = null;
  }


  openDeleteModal(template: TemplateModel) {
    this.templateToDelete = template;
    this.isDeleteModalOpen = true;
  }


  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.templateToDelete = {
      id: 0,
      name: '',
      body: '',
      active: true
    };;
  }

  confirmDelete() {
    if (this.templateToDelete) {
      this.deleteTemplate(this.templateToDelete);
      this.isDeleteModalOpen = false
    }
  }

  showTheInput(){
    this.showInput = true
  }

  showInfo() {
    const message = `
      <strong>Sistema de gestión de Plantillas</strong><br>
      Aquí puedes administrar todos las plantillas para correos del sistema.<br><br>

      <strong>Iconografía:</strong><br>
      Activos: <i class="bi bi-check2-circle text-success large-icon"></i><br>
      Inactivos: <i class="bi bi-x-circle text-danger large-icon"></i>
    `;

    this.showModal('Información', message);
  }



  getEmailTemplates() {
    this.templates = this.mocktemplates;
    this.templateService.getAllTemplates().subscribe({
      next: (data) => {
        data.map(d => d.active = true);
        this.templates = [...this.templates, ...data].sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        this.updatePagination();
      },
      error: () => {
        this.toastService.sendError("Error al cargar las plantillas");
      }
    });
  }
  deleteTemplate(deleteTemplate: TemplateModel) {

    const index = this.templates.findIndex(template => template.id === deleteTemplate.id);

    if (index !== -1) { 
        this.templates[index].active = false
        this.templates.splice(index, 1);
        this.toastService.sendSuccess("Plantilla eliminada correctamente")
    } else {
        this.toastService.sendError("Plantilla no encontrada")
    }
}


  saveEmailTemplate() {
    this.router.navigate(['/templates/new']);
  }

  exportToExcel() {
    this.templateService.getAllTemplates().subscribe((templates: TemplateModel[]) => {
      const data = templates.map(template => ({
          'ID': template.id,
          'Nombre': template.name,
          'Cuerpo': template.body,
          'Activo': template.active ? 'Activo' : 'Inactivo',
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Templates');
      const now = new Date();
      const dateTime = `${now.toLocaleDateString().replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
      const fileName = `Plantillas-Emails-${dateTime}.xlsx`; // Nombre del archivo
      XLSX.writeFile(wb, fileName);
  }, (error: any) => {
      this.toastService.sendError("Error al cargar las plantillas para generar el Excel")
  });
  }

  exportToPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Plantillas de Email', 14, 20);

    this.templateService.getAllTemplates().subscribe((templates: TemplateModel[]) => {
        autoTable(doc, {
            startY: 30,
            head: [['ID', 'Nombre', 'Cuerpo', 'Activo']],
            body: templates.map(template => [
                template.id,
                template.name,
                template.body,
                template.active ? 'Activo' : 'Inactivo'
            ]),
            columnStyles: { //para que no se rompa por si el body es muy grande
                0: { cellWidth: 15 }, // ID
                1: { cellWidth: 40 }, // Nombre
                2: { cellWidth: 100 }, // Body
                3: { cellWidth: 20 }, // Activo
            },
            styles: { overflow: 'linebreak' },
        });
        const now = new Date();
        const dateTime = `${now.toLocaleDateString().replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
        const fileName = `Plantillas-Email-${dateTime}.pdf`;

        doc.save(fileName);
        console.log('PDF generado');
    }, (error: any) => {
        this.toastService.sendError("Error al cargar las plantillas para generar el PDF")
    });
  }

  previewContent(template: TemplateModel): void {

    this.showModalToRenderHTML = true;
    setTimeout(() => {
      const iframe = this.iframePreview.nativeElement as HTMLIFrameElement;
      iframe.srcdoc = template.body;
      iframe.onload = () => {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          const height = iframeDocument.documentElement.scrollHeight;
          iframe.style.height = `${height}px`;
        }
      };
    }, 5);
  }

  closeModalToRenderHTML(): void {
    this.showModalToRenderHTML = false;
  }


  clearSearch() {
    this.searchTerm = '';
    this.showInput = false; // Ocultar input al limpiar
    this.getEmailTemplates();
  }

  onSearchTextChange(){

    this.showInput = true;
  }



  saveEditedTemplate() {
    if (this.editingtemplate) {
      // Lógica para guardar los cambios del template
      const index = this.templates.findIndex(t => t.id === this.editingtemplate.id);
      if (index !== -1) {
        this.templates[index] = { ...this.editingtemplate };

        this.templateService.updateTemplate(this.templates[index]).subscribe({
          next: () => {
            this.toastService.sendSuccess("Plantilla editada correctamente")
          },
          complete: () => {
            this.toastService.sendError("Error al editar plantilla")
          }
        })
      }
      this.closeEditModal();
    }
  }
  //Pagination
  get paginatedTemplates() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.templates.slice(startIndex, endIndex);
  }
}
