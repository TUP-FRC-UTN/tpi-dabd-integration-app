import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  TicketDetail,
  TicketDto,
  TicketStatus,
} from '../models/TicketDto';
import { CommonModule, DatePipe } from '@angular/common';
import { MercadoPagoServiceService } from '../services/mercado-pago-service.service';
import { TicketPayDto } from '../models/TicketPayDto';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { HttpClient } from '@angular/common/http';
import { Filter, FilterConfigBuilder, FilterOption, MainContainerComponent, TableComponent, TableFiltersComponent } from 'ngx-dabd-grupo01';
import { NgbDropdownModule, NgbModal, NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TranslateStatusTicketPipe } from '../pipes/translate-status-ticket.pipe';
import { PaginatedResponse } from '../models/api-response';
import { InfoComponent } from '../info/info.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Subject } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentExcelService } from '../services/payment-excel.service';
registerLocaleData(localeEs, 'es-ES');
@Component({
  selector: 'app-admin-list-expensas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbPagination,
    TranslateStatusTicketPipe,
    MainContainerComponent,
    TableFiltersComponent,
    NgbDropdownModule,
    NgbModule
  ],
  templateUrl: './admin-list-expensas.component.html',
  styleUrls: ['./admin-list-expensas.component.css'],
  providers: [DatePipe],
})
export class AdminListExpensasComponent implements OnInit {

  //#region ATT de PAGINADO
  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  ticketList: TicketDto[] = [];
  filteredTicketList: TicketDto[] = [];


  lastPage: boolean | undefined;
  totalItems: number = 0;
  //#endregion
  //#region NgOnInit | BUSCAR
  ngOnInit(): void {
    this.ticketStatusOptions = Object.keys(TicketStatus).map(key => ({
      key: key,
      value: TicketStatus[key as keyof typeof TicketStatus]
    }));

  }

  filterType: string = '';
  ticketStatusOptions: { key: string, value: string }[] = [];
  filterInput: TicketStatus | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;


  @ViewChild('ticketsTable', { static: true })
  tableName!: ElementRef<HTMLTableElement>;
  requestData: TicketPayDto = {
    idTicket: 0,
    title: '',
    description: '',
    totalPrice: 0,
  };

  ticketSelectedModal: TicketDto = {
    id: 0,
    ownerId: { id: 0, first_name: 'Esteban', second_name: '', last_name: '' },
    issueDate: new Date(),
    expirationDate: new Date(),
    ticketNumber: 'a',
    status: TicketStatus.PENDING,
    ticketDetails: [],
    lotId: 0,
  };

  listallticket: TicketDto[] = [];
  searchText = '';
  filteredTickets: TicketDto[] = [];
  fechasForm: FormGroup;
  totalTicketSelected: number = 0;



  LIMIT_32BITS_MAX = 2147483647;

 

  @Input() objectName: string = '';

  constructor(
    private mercadopagoservice: MercadoPagoServiceService,
    private formBuilder: FormBuilder,
    private ticketService: TicketService,
    private modalService: NgbModal,
    private excelService:PaymentExcelService
  ) {
    this.fechasForm = this.formBuilder.group({
      fechaInicio: [''],
      fechaFin: [''],
    });
  }

  setFilterType(type: string) {
    this.filterType = type;
    console.log(this.filterType)
  }

  buscar() {
    if (this.filterType === 'estado' && this.filterInput) {
      // Lógica para filtrar por estado
      console.log('Filtrar por estado:', this.filterInput);
    } else if (this.filterType === 'fecha' && this.fechaInicio && this.fechaFin) {
      // Lógica para filtrar por fecha
      console.log('Filtrar por fecha desde', this.fechaInicio, 'hasta', this.fechaFin);
    }
  }


  // Método para obtener todos los tickets usando el servicio
  getTickets(): void {
    this.ticketService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedResponse<TicketDto>) => {
        console.log('Tickets received:', response.content);
        this.listallticket = response.content;
        this.filteredTickets = response.content;
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error: (error) => {
        console.error('Error al obtener los tickets:', error);
      },
      complete: () => {
        console.log('Obtención de tickets completada.');
      },
    });
  }


  enviarFechas() {
    const fechas = this.fechasForm.value;
    console.log('Fechas Enviadas:', fechas);
    this.ticketService.filtrarfechas(fechas).subscribe(
      (filteredTickets: TicketDto[]) => {
        this.filteredTickets = filteredTickets;
      },
      (error) => {
        console.error('Error al filtrar tickets por fechas:', error);
      }
    );
  }
  onPageChange(page: number) {
    this.currentPage = --page;
    this.getTickets();
  }
  onItemsPerPageChange() {
    --this.currentPage;
  }
  searchTable() {
    const searchTextLower = this.searchText.toLowerCase();
    const searchNumber = parseFloat(this.searchText);

    this.filteredTickets = this.listallticket.filter(
      (ticket) =>
        ticket.ownerId.toString().includes(this.searchText) ||
        ticket.ticketDetails.some((item) =>
          item.description.toLowerCase().includes(searchTextLower)
        ) ||
        ticket.status
          .toString()
          .includes(searchTextLower.toLocaleUpperCase()) ||
        this.formatDate2(ticket.issueDate, 'MM/YYYY').includes(
          searchTextLower
        ) ||
        this.formatDate2(ticket.expirationDate, 'MM/YYYY').includes(
          searchTextLower
        ) ||
        (!isNaN(searchNumber) && this.calculateTotal(ticket) === searchNumber)
    );
  }

  formatDate2(date: Date, format: string): string {
    const pad = (num: number) => (num < 10 ? '0' + num : num.toString());
    if (format === 'MM/YYYY') {
      return `${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    } else {
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }

  calculateTotal(ticket: TicketDto): number {
    let total = 0;
    if (ticket && ticket.ticketDetails) {
      total = ticket.ticketDetails.reduce((acc, item: TicketDetail) => {
        return acc + item.amount;
      }, 0);
    }
    return total;
  }

  selectTicket(ticket: TicketDto) {
    this.ticketSelectedModal = ticket;
    console.log('Ticket seleccionado:', this.ticketSelectedModal);

    this.totalTicketSelected = this.calculateTotal(ticket);
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  pagar() {
    this.requestData.idTicket = this.ticketSelectedModal.id;
    this.requestData.description = `Expensas de ${this.formatDate(
      this.ticketSelectedModal.issueDate
    )}`;
    this.requestData.title = `Expensas de ${this.formatDate(
      this.ticketSelectedModal.issueDate
    )} con vencimiento: ${this.formatDate(
      this.ticketSelectedModal.expirationDate
    )}`;
    this.requestData.totalPrice = this.calculateTotal(this.ticketSelectedModal);
    console.log(this.requestData);
    this.mercadopagoservice.crearPreferencia(this.requestData).subscribe(
      (response) => {
        console.log('Preferencia creada:', response);
        this.mercadopagoservice.initMercadoPagoButton(response.id);
      },
      (error) => {
        console.error('Error al crear la preferencia:', error);
      }
    );
  }

  changeStatusOfTicket() {
    throw new Error('Method not implemented.');
  }




  confirmChange(): void {
    // Código para cambiar el estado del ticket
    this.closeAllModals();
  }

  closeAllModals(): void {
    // Cierra todos los modales abiertos
    (document.querySelector('#statusModal') as any).modal('hide');
    (document.querySelector('#confirmModal') as any).modal('hide');
  }



  // ACA SE ABRE EL MODAL DE INFO
  showInfo(): void {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.data = { role: 'admin' };
  }



  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const filterText = target.value.toLowerCase();
  
    if (filterText.length <= 2) {
      // Restaura la lista completa si el texto del filtro tiene menos de 3 caracteres
      this.filteredTickets = [...this.listallticket];
    } else {
      // Filtra los tickets visibles en la tabla
      this.filteredTickets = this.listallticket.filter(ticket => 
        this.matchVisibleFields(ticket, filterText)
      );
    }
  }
  
  // Función de coincidencia solo en los campos visibles
  matchVisibleFields(ticket: TicketDto, filterText: string): boolean {
    // Combina las propiedades visibles en un solo texto y verifica si contiene el filtro
    const propietario = `${ticket.ownerId.first_name} ${ticket.ownerId.second_name} ${ticket.ownerId.last_name}`.toLowerCase();
    const lote = ticket.lotId.toString();
    const periodo = this.formatPeriodo(ticket.issueDate);
    const total = this.calculateTotal(ticket).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    const estado = this.translateStatus(ticket.status).toLowerCase();
  
    return (
      propietario.includes(filterText) ||
      lote.includes(filterText) ||
      periodo.includes(filterText) ||
      total.includes(filterText) ||
      estado.includes(filterText)
    );
  }
  
  // Función para formatear la fecha de periodo como "MM/YYYY"
  formatPeriodo(date: Date): string {
    const month = new Date(date).getMonth() + 2;
    const year = new Date(date).getFullYear();
    return `${month.toString().padStart(2, '0')}/${year}`;
  }
  
  // Traduce el estado del ticket a español
  translateStatus(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.PAID:
        return 'Pagado';
      case TicketStatus.CANCELED:
        return 'Anulado';
      case TicketStatus.PENDING:
        return 'Pendiente';
      default:
        return '';
    }
  }






  getActualDayFormat() {
    const today = new Date();

    const formattedDate = today.toISOString().split('T')[0];

    return formattedDate;
  }
  /**
   * Export the HTML table to a PDF file.
   * Calls the `exportTableToPdf` method from the `CadastreExcelService`.
   */
  exportToPdf() {
    const doc = new jsPDF();
  
    // Título del PDF
    doc.setFontSize(18);
    doc.text('Tickets Report', 14, 20);
  
    this.ticketService.getAllTicketsPage(0, this.LIMIT_32BITS_MAX).subscribe(
      (response: PaginatedResponse<TicketDto>) => {
        // Accede a la propiedad `content` que contiene los tickets
        const expenses = response.content;
  
        autoTable(doc, {
          startY: 30,
          head: [['Propietario', 'Periodo', 'ID', 'Estado']],
          body: expenses.map((expense: TicketDto) => [
            `${expense.ownerId.first_name} ${expense.ownerId.last_name}`,
            expense.issueDate instanceof Date ? expense.issueDate.toLocaleDateString() : new Date(expense.issueDate).toLocaleDateString(),
            expense.id,
            expense.status
          ]),
        });
  
        // Guarda el PDF después de agregar la tabla
        doc.save('expenses_report.pdf');
      },
      (error) => {
        console.error('Error retrieved all, on export component.', error);
      }
    );
  }
  
  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  //#region TIENEN QUE MODIFICAR EL SERIVCIO CON SU GETALL
  exportToExcel() {
    this.ticketService.getAllTicketsPage(0, this.LIMIT_32BITS_MAX).subscribe(
      (response) => {
        const modifiedContent = response.content.map(({ id, ownerId,...rest }) => rest);
        this.excelService.exportListToExcel(
          modifiedContent,
          `${this.getActualDayFormat()}_${this.objectName}`
        );
      },
      (error) => {
        console.log('Error retrieved all, on export component.');
      }
    );
  }



  filteroptions: FilterOption[] = ["PAGADO", "ANULADO", "PENDIENTE"].map((status) => ({
    value: status,
    label: status,
  }));

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter("Propietario", "ownerId", "Ingrese un propietario")
    .numberFilter("Numero de lote", "lotId", "Ingrese un numero de lote")
    .checkboxFilter("Estado", "status", this.filteroptions)
    .build()


   // Método que detecta cambios en los filtros
   filterChange($event: Record<string, any>) {
    console.log($event); // Muestra los valores actuales de los filtros en la consola
    
    // Verifica si el filtro de estado tiene un cambio específico
    if ($event['status']?.includes("PAGADO")) {
      this.onPaidStatusSelected();
    }
  }

  // Método propio que se ejecuta cuando se selecciona "PAGADO" en el checkbox
  onPaidStatusSelected() {
    console.log("Se seleccionó el estado PAGADO.");
    // Aquí puedes agregar la lógica adicional que necesitas.
  }

  resetFilters() {
    this.filterConfig = new FilterConfigBuilder()
      .textFilter("Propietario", "ownerId", "Ingrese un propietario")
      .numberFilter("Numero de lote", "lotId", "Ingrese un numero de lote")
      .build();
  }
}
