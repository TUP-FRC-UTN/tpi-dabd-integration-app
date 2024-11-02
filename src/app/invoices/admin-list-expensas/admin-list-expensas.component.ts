import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  TicketDetail,
  TicketDto,
  TicketStatus,
} from '../models/TicketDto';
import { CommonModule } from '@angular/common';
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
import { TicketPaymentFilterButtonsComponent } from '../ticket-payment-filter-buttons/ticket-payment-filter-buttons.component';
import { MainContainerComponent, TableComponent } from 'ngx-dabd-grupo01';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TranslateStatusTicketPipe } from '../pipes/translate-status-ticket.pipe';
import { PaginatedResponse } from '../models/api-response';
import { InfoComponent } from '../info/info.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es-ES');
@Component({
  selector: 'app-admin-list-expensas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TicketPaymentFilterButtonsComponent,
    NgbPagination,
    TranslateStatusTicketPipe,
    MainContainerComponent,
  ],
  templateUrl: './admin-list-expensas.component.html',
  styleUrls: ['./admin-list-expensas.component.css'],
})
export class AdminListExpensasComponent implements OnInit {
  resetFilters() {
    throw new Error('Method not implemented.');
  }

  //#region ATT de PAGINADO
  currentPage: number = 0;
  pageSize: number = 2;
  sizeOptions: number[] = [5, 10, 50];
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

    this.getTickets();
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filteredList: TicketDto[]) => {
      this.filteredTicketList = filteredList;
      this.currentPage = 0;
    });
  }

  filterType: string = '';
  ticketStatusOptions: { key: string, value: string }[] = [];
  filterInput: TicketStatus | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  @ViewChild('filterComponent')
  filterComponent!: TicketPaymentFilterButtonsComponent<TicketDto>;
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

  constructor(
    private mercadopagoservice: MercadoPagoServiceService,
    private formBuilder: FormBuilder,
    private ticketservice: TicketService,
    private modalService: NgbModal
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
    this.ticketservice.getAll(this.currentPage, this.pageSize).subscribe({
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
    this.ticketservice.filtrarfechas(fechas).subscribe(
      (filteredTickets: TicketDto[]) => {
        this.filteredTickets = filteredTickets;
      },
      (error) => {
        console.error('Error al filtrar tickets por fechas:', error);
      }
    );
  }
  onPageChange(page: number) {
    debugger
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
}
