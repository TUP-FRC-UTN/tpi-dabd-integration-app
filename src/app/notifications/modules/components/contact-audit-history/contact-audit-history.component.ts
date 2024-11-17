import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent, Filter, FilterConfigBuilder, TableFiltersComponent } from 'ngx-dabd-grupo01';
import {  ContactAudit } from '../../../models/contacts/contactAudit';
import { ContactAuditService } from '../../../services/contact-audit.service';
import { Subscription } from 'rxjs';
import { ToastService } from 'ngx-dabd-grupo01';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActiveSearchTerm } from '../../../models/contacts/filters/activeSearchTerm';
import { Console } from 'console';


@Component({
  selector: 'app-contact-audit-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPagination,
    NgbDropdownModule,
    MainContainerComponent,
    TableFiltersComponent
  ],
  templateUrl: './contact-audit-history.component.html',
  styleUrl: './contact-audit-history.component.css',
  providers: [DatePipe]
})
export class ContactAuditHistoryComponent implements OnInit {


  private subscription = new Subscription()
  private readonly contactAuditService = inject(ContactAuditService)
  toastService: ToastService = inject(ToastService);
  isLoading: boolean = true;


    // Paginación
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;
    sizeOptions: number[] = [10, 25, 50];
  
  
  
    //Datos y estados
    contactAuditItems: ContactAudit[] = [];
    filteredContactAuditItems: ContactAudit[]=[];
  
    // Estados de modales
    isInformationModalOpen = false;
    informationModalTitle = '';
    informationModalMessage = '';
    selectedContactAudit: ContactAudit | null = null;
  

    // Filtros
    globalSearchTerm = '';
    filteredSearchTerm = '';
    selectedContactType: string = '';
    activeSearchTerm : ActiveSearchTerm = ActiveSearchTerm.GLOBAL;


    clearFilters() {
      this.activeSearchTerm = ActiveSearchTerm.GLOBAL;
      this.filteredSearchTerm = '';
      this.globalSearchTerm = '';
      this.selectedContactType = '';
      this.currentPage = 1;
      this.loadData();
    }


  filterConfig: Filter[] = new FilterConfigBuilder()
  .textFilter('Valor del contacto', 'contactValue', "Buscar por valor del contacto...")
  .selectFilter('Tipo', 'contactType', 'Seleccione un tipo de contacto', [
    {value: 'EMAIL', label: 'Correo electrónico'},
    {value: 'PHONE', label: 'Teléfono'},
    {value: 'SOCIAL_MEDIA_LINK', label: 'Red social'}
  ])
  .build()



  loadData():void { 
    this.isLoading = true;
    this.subscription.add(
      this.contactAuditService.getContactAudits().subscribe({
        next: (data : ContactAudit[]) =>
        {
          //console.log('Datos que llegan al componente contact-audit-history: ', data)
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

  
  private applyFilters() {
    this.currentPage = 1; // Resetear a la primera página al filtrar
    this.loadData();
  }
  

  

  getFilteredContactAudits(): void {
    this.filteredContactAuditItems = this.contactAuditItems.filter(item => {
      //console.log('item.contactType on getFilteredContactAudits: ', item.contactType);
      
      // Transformar item.contactType a formato no legible
      const itemContactTypeNonReadableFormat = this.contactAuditService.inverseMapContactType(item.contactType);
      //console.log('itemContactTypeNonReadableFormat: ', itemContactTypeNonReadableFormat);

      const matchesContactType = this.selectedContactType.trim() !== ''
        ? itemContactTypeNonReadableFormat === this.selectedContactType
        : true;
  

      const matchesGlobalSearchTerm = this.globalSearchTerm.trim() !== ''
        ? item.value.toLowerCase().includes(this.globalSearchTerm.toLowerCase())
        : true;

      const matchesFilteredSearchTerm = this.filteredSearchTerm.trim() !== ''
      ? item.value.toLowerCase().includes(this.filteredSearchTerm.toLowerCase())
      : true;
  
      // Devolver true solo si ambos criterios son satisfechos
      return matchesContactType && matchesGlobalSearchTerm && matchesFilteredSearchTerm ;
    });
  
    // Actualizar la cantidad total de items para la paginación
    this.updatePagination();
  }




  filterChange($event: Record<string, any>) {
    this.clearFilters();


    console.log('filterChange event: ', $event)
 
    if($event['contactType']  && $event['contactType'].trim() !== '' ) {
      //console.log('event contact type on filterChange: ', $event['contactType'])
      this.selectedContactType = $event['contactType']
    }

    if($event['contactValue']  && $event['contactValue'].trim() !== '' ) {
      this.activeSearchTerm = ActiveSearchTerm.FILTERED;
      this.filteredSearchTerm = $event['contactValue']
    }

    this.loadData();

  }





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



  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }



  onGlobalSearchTextChange(searchTerm: string) {
    this.globalSearchTerm = searchTerm;
    this.getFilteredContactAudits();
  }




  
  exportToPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Auditoría de Contactos', 14, 20);

    this.contactAuditService.getContactAudits().subscribe({
      next: (audits) => {
        autoTable(doc, {
          startY: 30,
          head: [['Fecha','Tipo revisión', 'Tipo contacto', 'Valor']],
          body: audits.map((audit) => [
            audit.revisionDate,
            audit.revisionType,
            audit.contactType,
            audit.value
          ]),
          columnStyles: {
            0: { cellWidth: 45 },  // Fecha del cambio - mantiene el ancho para las fechas
            //1: { cellWidth: 25 },  // ID de revisión - números cortos
            1: { cellWidth: 30 },  // Tipo de revisión - palabras como "Adición"/"Modificación"
            2: { cellWidth: 35 },  // Tipo de contacto - "Correo electrónico"
            3: { cellWidth: 60 }   // Valor - emails largos como nicolasgeronimrodigoku@gmail.com
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
      next: (audits) => {
        const data = audits.map((audit) => ({
          Fecha: audit.revisionDate,
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
      error: (error) => {
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
