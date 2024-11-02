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
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
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

    this.getTickets();
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




















  LIMIT_32BITS_MAX = 2147483647;
  private excelService = inject(PaymentExcelService);

  private ticketService = inject(TicketService);
  // Input to receive a generic list from the parent component
  @Input() itemsList!: TicketDto[];
  // Input to redirect to the form.
  @Input() formPath: string = '';
  // Represent the name of the object for the exports.
  // Se va a usar para los nombres de los archivos.
  @Input() objectName: string = '';
  // Represent the dictionaries of ur object.
  // Se va a usar para las traducciones de enum del back.
  @Input() dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<TicketDto[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();


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
      (response: any) => {
        autoTable(doc, {
          startY: 30,
          head: [['Periodo', 'Vencimiento', 'Total', 'Estado']],
          body: response.map((expense: any) => [
            expense.ownerId.first_name,
            expense.issueDate instanceof Date ? expense.issueDate.toLocaleDateString() : expense.issueDate, // convertir fecha a string
            expense.id,
            expense.status
          ]),
        });
      },
      () => {
        console.log('Error retrieved all, on export component.');
      }
    );
    

       // Guardar el PDF después de agregar la tabla
       doc.save('expenses_report.pdf');
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  //#region TIENEN QUE MODIFICAR EL SERIVCIO CON SU GETALL
  exportToExcel() {
    this.ticketService.getAllTicketsPage(0, this.LIMIT_32BITS_MAX).subscribe(
      (response) => {
        const modifiedContent = response.content.map(({ id, ...rest }) => rest);
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

  /**
   * Filters the list of items based on the input value in the text box.
   * The filter checks if any property of the item contains the search string (case-insensitive).
   * The filtered list is then emitted through the `filterSubject`.
   *
   * @param event - The input event from the text box.
   */
  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    console.log(target);
  
    if (target.value?.length <= 2) {
      this.filterSubject.next(this.itemsList);
    } else {
      const filterValue = target.value.toLowerCase();
  
      const filteredList = this.itemsList.filter((item) => {
        return Object.values(item).some((prop) => {
          const propString = prop ? prop.toString().toLowerCase() : '';
  
          const translations =
            this.dictionaries && this.dictionaries.length
              ? this.dictionaries
                  .map((dict) => this.translateDictionary(propString, dict))
                  .filter(Boolean)
              : [];
  
          return (
            propString.includes(filterValue) ||
            translations.some((trans) =>
              trans?.toLowerCase().includes(filterValue)
            )
          );
        });
      });
  
      this.filterSubject.next(filteredList.length > 0 ? filteredList : []);
    }
  }

  /**
   * Translates a value using the provided dictionary.
   *
   * @param value - The value to translate.
   * @param dictionary - The dictionary used for translation.
   * @returns The key that matches the value in the dictionary, or undefined if no match is found.
   */
  translateDictionary(value: any, dictionary?: { [key: string]: any }) {
    if (value !== undefined && value !== null && dictionary) {
      for (const key in dictionary) {
        if (dictionary[key].toString().toLowerCase() === value.toLowerCase()) {
          return key;
        }
      }
    }
    return;
  }

  filteroptions : FilterOption[] = ["PAGADO", "ANULADO", "PENDIENTE"].map((status) => ({
    value: status,
    label: status,
    }));

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter("Propietario", "ownerId", "Ingrese un propietario")
    .numberFilter("Numero de lote", "lotId", "Ingrese un numero de lote")
    .checkboxFilter("Estado", "status", this.filteroptions)
    .build()


  filterChange($event: Record<string, any>) {
    console.log($event)
  }

  resetFilters() {
    this.filterConfig = new FilterConfigBuilder()
    .textFilter("Propietario", "ownerId", "Ingrese un propietario")
    .numberFilter("Numero de lote", "lotId", "Ingrese un numero de lote")
    .build()
  }
}
