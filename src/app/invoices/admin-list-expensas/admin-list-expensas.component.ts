import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  PlotFilters,
  PlotStatusDictionary,
  PlotTypeDictionary,
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
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TranslateStatusTicketPipe } from '../pipes/translate-status-ticket.pipe';
@Component({
  selector: 'app-admin-list-expensas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TicketPaymentFilterButtonsComponent,
    NgbPagination,
    TranslateStatusTicketPipe
  ],
  templateUrl: './admin-list-expensas.component.html',
  styleUrls: ['./admin-list-expensas.component.css'],
})
export class AdminListExpensasComponent implements OnInit {
  //#region ATT de PAGINADO
  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  plotsList: TicketDto[] = [];
  filteredPlotsList: TicketDto[] = [];
  lastPage: boolean | undefined;
  totalItems: number = 0;
  //#endregion
  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilterPlot();
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filteredList: TicketDto[]) => {
      this.filteredPlotsList = filteredList;
      this.currentPage = 0;
    });
  }

  //#region ATT de DICCIONARIOS
  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  plotDictionaries = [this.plotTypeDictionary, this.plotStatusDictionary];
  //#endregion

  //#region ATT de ACTIVE
  retrievePlotsByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = [];
  actualFilter: string | undefined = PlotFilters.NOTHING;
  filterTypes = PlotFilters;
  filterInput: string = '';
  //#endregion

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

  constructor(
    private mercadopagoservice: MercadoPagoServiceService,
    private formBuilder: FormBuilder,
    private ticketservice: TicketService
  ) {
    this.fechasForm = this.formBuilder.group({
      fechaInicio: [''],
      fechaFin: [''],
    });
  }

  // Método para obtener todos los tickets usando el servicio
  getTickets(): void {
    this.ticketservice.getAllTickets().subscribe({
      next: (tickets: TicketDto[]) => {
        this.listallticket = tickets;
        this.filteredTickets = tickets;
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
    this.currentPage = --page;
    this.confirmFilterPlot();
  }
  onItemsPerPageChange() {
    --this.currentPage;
    this.confirmFilterPlot();
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

  // downloadPdf(ticketId: Number): void {
  //   this.ticketservice.downloadPdf(ticketId).subscribe(
  //     (blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = 'example.pdf'; // Nombre del archivo descargado
  //       link.click();
  //       window.URL.revokeObjectURL(url); // Limpia la URL del blob después de la descarga
  //     },
  //     (error) => {
  //       console.error('Error al descargar el PDF:', error);
  //     }
  //   );
  // }

  //#region APLICACION DE FILTROS
  changeActiveFilter(isActive?: boolean) {
    this.retrievePlotsByActive = isActive;
    this.confirmFilterPlot();
  }

  confirmFilterPlot() {
    switch (this.actualFilter) {
      case 'NOTHING':
        this.getAllPlots();
        break;

      case 'BLOCK_NUMBER':
        // this.filterPlotByBlock(this.filterInput);
        break;

      case 'PLOT_STATUS':
        // this.filterPlotByStatus(this.translateCombo(this.filterInput, this.plotStatusDictionary));
        break;

      case 'PLOT_TYPE':
        // this.filterPlotByType(this.translateCombo(this.filterInput, this.plotTypeDictionary));
        break;

      default:
        break;
    }
  }

  getAllPlots() {
    this.ticketservice.getAll(this.currentPage, this.pageSize).subscribe(
      (response) => {
        console.log('Types retrieved succesfully:', response);
        this.plotsList = response.content;
        this.filteredPlotsList = [...this.plotsList];
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      (error) => {
        console.error('Error getting plots:', error);
      }
    );
  }

  changeFilterMode(mode: PlotFilters) {
    switch (mode) {
      case PlotFilters.NOTHING:
        this.actualFilter = PlotFilters.NOTHING;
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.confirmFilterPlot();
        break;

      case PlotFilters.BLOCK_NUMBER:
        this.actualFilter = PlotFilters.BLOCK_NUMBER;
        this.applyFilterWithNumber = true;
        this.applyFilterWithCombo = false;
        break;

      case PlotFilters.PLOT_STATUS:
        this.actualFilter = PlotFilters.PLOT_STATUS;
        this.contentForFilterCombo = this.getKeys(this.plotStatusDictionary);
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      case PlotFilters.PLOT_TYPE:
        this.actualFilter = PlotFilters.PLOT_TYPE;
        this.contentForFilterCombo = this.getKeys(this.plotTypeDictionary);
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      default:
        break;
    }
  }

  //#region USO DE DICCIONARIOS
  getKeys(dictionary: any) {
    return Object.keys(dictionary);
  }
}
