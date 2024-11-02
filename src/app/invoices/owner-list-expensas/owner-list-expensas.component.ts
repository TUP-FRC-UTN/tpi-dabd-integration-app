import { Component, ElementRef, Input, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import {
  PlotFilters,
  PlotStatusDictionary,
  PlotTypeDictionary,
  TicketDetail,
  TicketDto,
  TicketStatus,
} from '../models/TicketDto';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { MainContainerComponent, TableComponent } from 'ngx-dabd-grupo01';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TranslateStatusTicketPipe } from '../pipes/translate-status-ticket.pipe';
import { CapitalizePipe } from '../pipes/capitalize.pipe';

@Component({
  selector: 'app-owner-list-expensas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    MainContainerComponent, NgbPagination,
    TranslateStatusTicketPipe,
    CapitalizePipe
  ],
  templateUrl: './owner-list-expensas.component.html',
  styleUrl: './owner-list-expensas.component.css',
})
export class OwnerListExpensasComponent {
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
    ownerId: {id:1, first_name:'Esteban', last_name:'', second_name:''},
    issueDate: new Date(),
    expirationDate: new Date(),
    status: TicketStatus.PENDING,
    ticketNumber:'xx',
    lotId:0,
    ticketDetails: [
      { id: 1, amount: 20, description: 'Description of Item A' },
    ],
  };

  listallticket: TicketDto[] = [];
  searchText = '';
  filteredTickets: TicketDto[] = [];
  fechasForm: FormGroup;

  selectedFile: File | null = null;

  constructor(
    private mercadopagoservice: MercadoPagoServiceService,
    private formBuilder: FormBuilder,
    private ticketservice: TicketService,
    private http: HttpClient
  ) {
    

    // this.listallticket.push(this.ticketSelectedModal);
    this.filteredTickets = this.listallticket;
    this.fechasForm = this.formBuilder.group({
      fechaInicio: [''],
      fechaFin: [''],
    });
  }

  //#region APLICACION DE FILTROS
  changeActiveFilter(isActive?: boolean) {
    this.retrievePlotsByActive = isActive;
    this.confirmFilterPlot();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
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
        this.filterPlotByType(this.translateCombo(this.filterInput, this.plotTypeDictionary));
        break;

      default:
        break;
    }
  }

  translateCombo(value: any, dictionary: any) {
    if (value !== undefined && value !== null) {
      return dictionary[value];
    }
    console.log("Algo salio mal.")
    return;
  }

  filterPlotByType(plotType : string) {
    this.ticketservice.filterTicketByStatus(this.currentPage, this.pageSize, plotType).subscribe(
      response => {
        console.log("Types retrieved succesfully:", response)
        this.plotsList = response.content;
        this.filteredPlotsList = [...this.plotsList]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting plots:', error);
      }
    )
  }

  getAllPlots() {
    this.ticketservice.getAllByOwner(this.currentPage, this.pageSize).subscribe(
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
  //#endregion

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

  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post('http://localhost:8080/files/upload', formData).subscribe(
        (response) => {
          console.log('File uploaded successfully!', response);
        },
        (error) => {
          console.error('Error uploading file:', error);
        }
      );
    }
  }
  //#region FUNCIONES PARA PAGINADO
  onItemsPerPageChange() {
    --this.currentPage;
    this.confirmFilterPlot();
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

  searchTable() {
    const searchTextLower = this.searchText.toLowerCase();
    const searchNumber = parseFloat(this.searchText);

    this.filteredTickets = this.listallticket.filter(
      (ticket) =>
        ticket.issueDate.toString().includes(this.searchText) ||
        ticket.ticketDetails.some((item) =>
          item.description.toLowerCase().includes(searchTextLower)
        ) ||
        ticket.status
          .toString()
          .includes(searchTextLower.toLocaleUpperCase()) ||
        this.formatDate2(ticket.issueDate, 'MMMM/Y').includes(
          searchTextLower
        ) ||
        this.formatDate2(ticket.expirationDate, 'MMMM/YY').includes(
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
    this.pagar();
  }

  onPageChange(page: number) {
    this.currentPage = --page;
    this.confirmFilterPlot();
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  isButtonInitialized: boolean = false;
  pagar() {
    this.requestData.idTicket = this.ticketSelectedModal.id;
    this.requestData.description ='ads';// `Expensas de ${this.formatDate(this.ticketSelectedModal.issueDate)}`;
    this.requestData.title = 'ads';//`Expensas de ${this.formatDate(this.ticketSelectedModal.issueDate )} con vencimiento: ${this.formatDate(
      // this.ticketSelectedModal.expirationDate
    // )}`;
    this.requestData.totalPrice = this.calculateTotal(this.ticketSelectedModal);
    console.log(this.requestData);
    this.mercadopagoservice.crearPreferencia(this.requestData).subscribe(
      (response) => {
        console.log('Preferencia creada:', response);

        if (!this.isButtonInitialized) {
          this.mercadopagoservice.initMercadoPagoButton(response.id);
          this.isButtonInitialized = true;
        }

        // this.mercadopagoservice.initMercadoPagoButton(response.id);
      },
      (error) => {
        console.error('Error al crear la preferencia:', error);
      }
    );
  }
}
