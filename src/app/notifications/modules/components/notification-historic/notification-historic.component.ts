import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Notification } from '../../../models/notifications/notification';
import { MainContainerComponent, Filter, FilterConfigBuilder, TableFiltersComponent } from 'ngx-dabd-grupo01';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotificationService } from '../../../services/notification.service';
import { NotificationFilter } from '../../../models/notifications/filters/notificationFilter';
//import {Filter, FilterConfigBuilder } from 'ngx-dabd-grupo01'

@Component({
  selector: 'app-notification-historic',
  standalone: true,
  imports: [CommonModule, NgbPagination,  FormsModule, MainContainerComponent, TableFiltersComponent],
  templateUrl: './notification-historic.component.html',
  styleUrl: './notification-historic.component.css',
  providers: [DatePipe]
})
export class NotificationHistoricComponent implements OnInit {
  notifications: Notification[] = [];
  selectedNotification?: Notification;
  filteredNotifications: Notification[] = [];


  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sizeOptions: number[] = [10, 25, 50];

  // Modal Info
  modalTitle = '';
  modalMessage = '';
  isModalOpen = false;

  // Modal Noti
  modalTitleNoti = '';
  modalMessageNoti = '';
  isModalOpenNoti = false;
  showModalToRenderHTML: boolean = false;

  // Filtros
  globalSearchTerm = '';
  statusFilter: string = '';
  dateFrom: string = '';
  dateUntil: string = '';

  //Dropdown filters

  recipientFilter: string = '';
  notificationSubjectFilter: string = '';


  

  filterConfig: Filter[] = new FilterConfigBuilder()
.textFilter('Asunto', 'subject', "Buscar por asunto...")
.textFilter('Usuario', "recipient", "Buscar por email de destinatario...")
.selectFilter('Estado', 'statusSend', 'Seleccione un estado', [
  {value: 'ALL', label: 'Todas'},
  {value: 'SENT', label: 'Enviadas'},
  {value: 'VISUALIZED', label: 'Vistas'}
])
.dateFilter("Fecha desde:", "dateFrom", "Fecha:"  )
.dateFilter("Fecha hasta:", "dateUntil", "Fecha:"  )
.build();





  private notificationService = inject(NotificationService);
  @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;

  ngOnInit(): void {

    this.loadNotifications();
  }

  constructor() {
    this.initializePagination();
  }

  formatDateToISOStart = (dateString: string): string => {
    if (!dateString) return '';
    // Toma la fecha del datepicker y le agrega el tiempo al inicio del día (00:00:00)
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };
  
   formatDateToISOEnd = (dateString: string): string => {
    if (!dateString) return '';
    // Toma la fecha del datepicker y le agrega el tiempo al final del día (23:59:59)
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };



  /*
   
  applyDropdownFilters(){
    if(this.currentDropdownFilter !== 'dateFilter'){
      this.showFilteredTextSearchInput = true;
      this.showDatePickerFilter = false;
    } else {
      this.showDatePickerFilter = true;
      this.showFilteredTextSearchInput = false;
    }

  }
    */

  /*
  
  onFilteredSearchTextChange(filteredSearchTerm: string) {
    this.filteredSearchTerm = filteredSearchTerm;
    if(this.currentDropdownFilter === 'recipientFilter'){
      this.recipientFilter = filteredSearchTerm;
    }
    if(this.currentDropdownFilter === 'subjectFilter'){
      this.notificationSubjectFilter = filteredSearchTerm;
    }
    this.loadNotifications();
  }
    */

  /*

  onDatePickerFilterChange(): void {
    // Validamos que las fechas tengan sentido
    if (this.dateFrom && this.dateUntil) {
      const fromDate = new Date(this.dateFrom);
      const untilDate = new Date(this.dateUntil);
      
      if (fromDate > untilDate) {
        console.error('La fecha "Desde" no puede ser posterior a la fecha "Hasta"');
        return;
      }
    }
    
    this.currentPage = 1; 
    this.loadNotifications();
  }

  */

  
 
  filterChange($event: Record<string, any>) {

    this.clearFilters();
    
    if($event['statusSend'] && $event['statusSend'].trim() !== '' )
    {
      if($event['statusSend']==='SENT'){
         this.statusFilter = 'SENT';
  
      } else if ($event['statusSend']==='VISUALIZED' ) {
        this.statusFilter = 'VISUALIZED'
      } else {
        this.statusFilter = 'ALL'
      }

    }
  
    if($event['subject'] && $event['subject'].trim() !== ''){
      this.notificationSubjectFilter = $event['subject'];
    }
    if($event['recipient'] && $event['recipient'].trim() !== ''){
      this.recipientFilter = $event['recipient'];
    }

    if($event['dateFrom'] && $event['dateFrom'].trim() !== ''){
      this.dateFrom = $event['dateFrom'];
    }

    
    if($event['dateUntil'] && $event['dateUntil'].trim() !== ''){
      this.dateUntil = $event['dateUntil'];
    }



    this.loadNotifications();
  }


  loadNotifications(): void {

    const filter: NotificationFilter = {
      search_term: this.globalSearchTerm,
      viewed: this.statusFilter === 'VISUALIZED' ? true : this.statusFilter === 'SENT' ? false : undefined,
      subject: this.notificationSubjectFilter,
      from: this.dateFrom ? this.formatDateToISOStart(this.dateFrom) : undefined,
      until: this.dateUntil ? this.formatDateToISOEnd(this.dateUntil) : undefined,
      recipient: this.recipientFilter || undefined
    };

    const pageRequest = {
      page: this.currentPage,
      size: this.itemsPerPage,
      sort: ['id,asc']
    };


    this.notificationService.getPaginatedNotifications(filter, pageRequest)
      .subscribe({
        next: (response) => {
          this.notifications = response.content;
          this.filteredNotifications = this.notifications;
          this.totalItems = response.totalElements;
        },
        error: (error)=>{
          console.error('Error loading notifications: ', error);
        
        }
      });

  }


  
  /*
  onFilterChange(filterType: string){
    this.currentDropdownFilter = filterType;
    this.applyDropdownFilters();
  } */
 

  


  
  filterByStatus(status: 'SENT' | 'VISUALIZED' | 'ALL' ) {

    this.statusFilter = status;
    this.loadNotifications();
  }


  





  exportToExcel(): void {
    const data = this.filteredNotifications.map((notification) => ({
      Usuario: notification.recipient,
      'Asunto': notification.templateName,
      Fecha: notification.dateSend,
      Estado: notification.statusSend === "VISUALIZED" ? "VISTO" : "PENDIENTE",
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notificaciones');
    const now = new Date();
    const dateTime = `${now.toLocaleDateString().replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
    const fileName = `Notificaciones-${dateTime}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Notificaciones', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Usuario', 'Asunto', 'Fecha', 'Estado']],
      body: this.filteredNotifications.map((notification) => [
        notification.recipient,
        notification.templateName,
        new Date(notification.dateSend).toLocaleDateString() + ' ' + new Date(notification.dateSend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notification.statusSend === "VISUALIZED" ? "VISTO" : "PENDIENTE",
      ]),
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
      },
      styles: { overflow: 'linebreak' },
    });
    const now = new Date();
    const dateTime = `${now.toLocaleDateString().replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
    //seteamos nombre pdf
    const fileName = `Notificaciones-${dateTime}`;
    doc.save(fileName+".pdf");
  }

  clearFilters(): void {
    this.notificationSubjectFilter = '';
    this.dateFrom = '';
    this.dateUntil = '';
    this.recipientFilter = '';
    this.statusFilter = ''
    this.globalSearchTerm = '';
    this.currentPage = 1;
  }

  onGlobalSearchTextChange(globalSearch: string): void {
    this.globalSearchTerm = globalSearch;
    this.loadNotifications();
  }

  initializePagination() {
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.notifications.length;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.loadNotifications();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadNotifications();
  }

  // Modal handlers
  showModalInfo(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isModalOpen = true;
  }

  showModalNoti(title: string, message: string) {
    this.modalTitleNoti = title;
    this.modalMessageNoti = message;
    this.isModalOpenNoti = true;
  }

  verNotification(notification: Notification): void {
    this.selectedNotification = notification;
    const message = notification.body;
    this.isModalOpenNoti = true;
    this.showModalNoti(notification.subject, message);
  }

  showInfo() {
    const message = `
      <strong>Sistema de control de notificaciones</strong><br>
      Aquí puedes visualizar todos las notificaciones del sistema.<br><br>
      <strong>Iconografía:</strong><br>
      Visto: <i class="bi bi-check2-circle text-success large-icon"></i><br>
      No visto: <i class="bi bi-x-circle text-danger large-icon"></i><br>
      Ver: <i class="bi bi-eye text-info" style="font-size: 1.3rem; color:info"></i>
    `;
    this.showModalInfo('Información', message);
  }

  // Pagination
  get paginatedNotifications() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredNotifications.slice(startIndex, endIndex);
  }

  previewContent(notification: Notification): void {
    this.showModalToRenderHTML = true;
    this.selectedNotification = notification;
    setTimeout(() => {
      const iframe = this.iframePreview.nativeElement as HTMLIFrameElement;
      iframe.srcdoc = notification.body; // Usa el body de la notificación como contenido del iframe
      iframe.onload = () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          const height = iframeDocument.documentElement.scrollHeight;
          iframe.style.height = `${height}px`; // Ajusta la altura del iframe
        }
      };
    }, 5);
  }

  // Cierra los modales
  closeModal(): void {
    this.isModalOpen = false;
    this.isModalOpenNoti = false;
    this.selectedNotification = undefined;
  }

  closeModalToRenderHTML(): void {
    this.showModalToRenderHTML = false;
  }




}
