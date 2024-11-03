import { Component, ElementRef, Input, LOCALE_ID, OnInit, ViewChild, NgModule } from '@angular/core';
import {
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
import { Filter, FilterConfigBuilder, MainContainerComponent, TableComponent, TableFiltersComponent } from 'ngx-dabd-grupo01';
import { NgbModal, NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TranslateStatusTicketPipe } from '../pipes/translate-status-ticket.pipe';
import { CapitalizePipe } from '../pipes/capitalize.pipe';
import { InfoComponent } from '../info/info.component';
import { DatePipe } from '@angular/common';

import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');
@Component({
  selector: 'app-owner-list-expensas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    MainContainerComponent,
    NgbPagination,
    TranslateStatusTicketPipe,
    CapitalizePipe,
    TableFiltersComponent,
    NgbModule
  ],
  templateUrl: './owner-list-expensas.component.html',
  styleUrl: './owner-list-expensas.component.css',
  providers: [DatePipe,
    { provide: LOCALE_ID, useValue: 'es' },
  ],
})
export class OwnerListExpensasComponent {

  //#region ATT de PAGINADO
  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  ticketOwnerList: TicketDto[] = [];
  filteredTicketList: TicketDto[] = [];
  lastPage: boolean | undefined;
  totalItems: number = 0;



  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter("Propietario", "ownerId", "Ingrese un propietario")
    .numberFilter("Numero de lote", "lotId", "Ingrese un numero de lote")
    .build()





  @ViewChild('ticketsTable', { static: true })
  tableName!: ElementRef<HTMLTableElement>;

  requestData: TicketPayDto = {
    idTicket: 0,
    title: '',
    description: '',
    totalPrice: 0,
  };


  filterChange($event: Record<string, any>) {
    throw new Error('Method not implemented.');
  }


  ticketSelectedModal: TicketDto = {
    id: 0,
    ownerId: { id: 1, first_name: 'Esteban', last_name: '', second_name: '' },
    issueDate: new Date(),
    expirationDate: new Date(),
    status: TicketStatus.PENDING,
    ticketNumber: 'xx',
    lotId: 0,
    ticketDetails: [
      { id: 1, amount: 20, description: 'Description of Item A' },
    ],
  };
  isButtonInitialized: boolean = false;
  listallticket: TicketDto[] = [];
  filteredTickets: TicketDto[] = [];
  fechasForm: FormGroup;

  selectedFile: File | null = null;

  constructor(
    private mercadopagoservice: MercadoPagoServiceService,
    private formBuilder: FormBuilder,
    private ticketservice: TicketService,
    private http: HttpClient,
    private modalService: NgbModal,
    private datePipe: DatePipe
  ) {


   
    this.fechasForm = this.formBuilder.group({
      fechaInicio: [''],
      fechaFin: [''],
    });
  }
  ngOnInit() {
    this.ticketservice.getAllByOwner(this.currentPage, this.pageSize).subscribe(
      (response) => {
        console.log('Tickets del propietario:', response);
        this.ticketOwnerList = response.content; // Lista original de tickets
        this.filteredTickets = [...this.ticketOwnerList]; // Inicializa los tickets filtrados con los datos originales
        this.totalItems = response.totalElements; // Total de elementos para paginación
        this.lastPage = response.last; // Verifica si es la última página
      },
      (error) => {
        console.error('Error al obtener los tickets del propietario', error);
      }
    );
  }
  

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
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
  }



  pagar() {
    this.requestData.idTicket = this.ticketSelectedModal.id;
    this.requestData.description = 'ads';// `Expensas de ${this.formatDate(this.ticketSelectedModal.issueDate)}`;
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






  // ACA SE ABRE EL MODAL DE INFO
  showInfo(): void {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.data = { role: 'owner' };
  }
}
