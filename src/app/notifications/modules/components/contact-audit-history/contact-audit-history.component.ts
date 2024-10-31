import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import {  ContactAudit } from '../../../models/contacts/contactAudit';
import { ContactAuditService } from '../../../services/contact-audit.service';
import { Subscription } from 'rxjs';
import { ToastService } from 'ngx-dabd-grupo01';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-contact-audit-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPagination,
    NgbDropdownModule,
    MainContainerComponent
  ],
  templateUrl: './contact-audit-history.component.html',
  styleUrl: './contact-audit-history.component.css'
})
export class ContactAuditHistoryComponent implements OnInit {


  toastService: ToastService = inject(ToastService);

  isLoading: boolean = true;

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sizeOptions: number[] = [10, 25, 50];


  // Filtros
  searchTerm = '';
  selectedContactType: string = '';

  //Datos y estados
  contactAuditItems: ContactAudit[] = [];
  filteredContactAuditItems: ContactAudit[]=[];

  // Estados de modales
  isInformationModalOpen = false;
  informationModalTitle = '';
  informationModalMessage = '';
  selectedContactAudit: ContactAudit | null = null;

   //Estado de filtors
   showInput: boolean = false;


  // Modal handlers
  showInformationModal(title: string, message: string) {
    this.informationModalTitle = title;
    this.informationModalMessage = message;
    this.isInformationModalOpen = true;
  }

  closeInformationModal() {
    this.isInformationModalOpen = false;
  }




  showInfo() {
    const message = `
      <strong>Sistema de gestión de contactos</strong><br>
      Visualización de auditoría de contactos.<br><br>

    `;

    this.showInformationModal('Información', message);
  }


  // Paginación
  initializePagination() {
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.filteredContactAuditItems.length;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.loadData();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadData();
  }




  private subscription = new Subscription()


  private readonly contactAuditService = inject(ContactAuditService)


  loadData():void {
    this.isLoading = true;
    this.subscription.add(
      this.contactAuditService.getContactAudits().subscribe({
        next: (data : ContactAudit[]) =>
        {
          //console.log('Datos que llegan al componente: ', data)
          this.contactAuditItems = data;
          this.getFilteredContactAudits();
          this.isLoading = false;
        }

      })
    )
  }

  ngOnInit():void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  clearSearch() {
    this.searchTerm = '';
    this.selectedContactType = '';
    this.showInput = false; // Ocultar input al limpiar
    this.loadData();
  }

  filterByContactType(contactType: string): void {
    this.showInput = true;
    this.selectedContactType = contactType;
    this.getFilteredContactAudits();
  }

  onSearchTextChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.getFilteredContactAudits();
  }


  getFilteredContactAudits(): void {
    this.filteredContactAuditItems = this.contactAuditItems.filter(item => {

      //Transformar item.contactType de string legible a EMAIL - PHONE - etc para poder hacer la comp.
     const itemContactTypeNonReadableFormat = this.contactAuditService.inverseMapContactType(item.contactType);

      const matchesContactType = this.selectedContactType
        ? itemContactTypeNonReadableFormat === this.selectedContactType
        : true;

      const matchesSearchTerm = this.searchTerm
        ? item.value.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      return matchesContactType && matchesSearchTerm;
    });

    // Actualizar la cantidad total de items para la paginación
    this.updatePagination();
  }


  
  exportToPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Auditoría de Contactos', 14, 20);

    this.contactAuditService.getContactAudits().subscribe({
      next: (audits) => {
        autoTable(doc, {
          startY: 30,
          head: [['Fecha', 'ID revisión', 'Tipo revisión', 'Tipo contacto', 'Valor']],
          body: audits.map((audit) => [
            audit.revisionDate,
            audit.revisionId,
            audit.revisionType,
            audit.contactType,
            audit.value
          ]),
          columnStyles: {
            0: { cellWidth: 30 },  // Fecha del cambio - mantiene el ancho para las fechas
            1: { cellWidth: 25 },  // ID de revisión - números cortos
            2: { cellWidth: 20 },  // Tipo de revisión - palabras como "Adición"/"Modificación"
            3: { cellWidth: 35 },  // Tipo de contacto - "Correo electrónico"
            4: { cellWidth: 60 }   // Valor - emails largos como nicolasgeronimrodigoku@gmail.com
          },
          styles: { overflow: 'linebreak' },
        });
        const now = new Date();
        const dateTime = `${now
          .toLocaleDateString()
          .replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
        const fileName = `AuditoriaContactos-${dateTime}.pdf`;

        doc.save(fileName);
      },
      error: (error) => {
        this.toastService.sendError("Hubo un error generando el archivo PDF");
      },
    });
  }

  exportToExcel() {
    // Implementar la lógica de exportación a Excel
    this.contactAuditService.getContactAudits().subscribe({
      next: (audits:any) => {
        const data = audits.map((audit:any) => ({
          Fecha: audit.revisionDate,
          ID_revision: audit.revisionId,
          Tipo_revision: audit.revisionType,
          Tipo_contacto: audit.contactType,
          Valor: audit.value
        }));

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
        const now = new Date();
        const dateTime = `${now
          .toLocaleDateString()
          .replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
        const fileName = `AuditoríaContactos-${dateTime}.xlsx`; // Nombre del archivo
        XLSX.writeFile(wb, fileName);
      },
      error: (error:any) => {
        this.toastService.sendError("Hubo un error generando el archivo Excel");
      },
    });
  }
  //Pagination
  get paginatedContacts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredContactAuditItems.slice(startIndex, endIndex);
  }
}
