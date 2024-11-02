import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TicketDto } from '../models/TicketDto';
import { tick } from '@angular/core/testing';
import { PaginatedResponse } from '../models/api-response';
import { TransformTicketPipe } from '../pipes/ticket-mapper.pipe';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = 'http://localhost:8087/tickets';

  private apiUrlPdf = 'http://localhost:8087/tickets/generateTicket/'; 

  private api = 'http://localhost:8087/tickets/getAllTicketsByOwner';
  private apiCounter = 'http://localhost:8087/tickets/getAll';
  

  constructor(private http: HttpClient) { }

  filtrarfechas(dtobusqueda: any):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/search`, dtobusqueda);
  }



  getAllTicketsContent(): Observable<TicketDto[]> {
    return this.http.get<{ content: TicketDto[] }>('http://localhost:8080/tickets/getAll').pipe(
      map(response => response.content) // Extrae solo `content` del objeto de respuesta
    );
  }
  

  getAll(page : number, size : number): Observable<PaginatedResponse<TicketDto>> {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
      
    return this.http.get<PaginatedResponse<TicketDto>>(this.apiCounter, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformTicketPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  filterTicketByStatus(page : number, size : number, plotType : string) {
    let params = new HttpParams()
    .set('ownerId', 1)
    .set('status', 'PAID')
    .set('page', page.toString())
    .set('size', size.toString());
  
    return this.http.get<PaginatedResponse<TicketDto>>(this.api, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformTicketPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  // getAllForPDFUser()

  getAllByOwner(page : number, size : number): Observable<PaginatedResponse<TicketDto>> {
    let params = new HttpParams()
    .set('ownerId', 1)
    .set('page', page.toString())
    .set('size', size.toString());
      
    return this.http.get<PaginatedResponse<TicketDto>>(this.api, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformTicketPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  getAllTicketsPage(page : number, size : number): Observable<PaginatedResponse<TicketDto>> {
    const ownerId = 1;
    let params = new HttpParams()
    .set('ownerId', ownerId.toString())
    .set('page', page.toString())
    .set('size', size.toString());
    debugger
    return this.http.get<PaginatedResponse<TicketDto>>(this.api, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformTicketPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots   
        };
      })
    );
  }

  downloadPdf(ticketId: Number): Observable<Blob> {
    return this.http.get(this.apiUrlPdf + ticketId, {
      responseType: 'blob' // Necesario para manejar archivos
    });
  }

  
  private itemsSubject = new BehaviorSubject<TicketDto[]>([]);
  private totalItemsSubject = new BehaviorSubject<number>(0);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  items$ = this.itemsSubject.asObservable();
  totalItems$ = this.totalItemsSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  loadData(page: number | null, size: number | null): void {
    this.isLoadingSubject.next(true);
    const allItems = [
      {
        id: 1,
        ownerId: 101,
        issueDate: new Date(2024, 9, 15),
        expirationDate: new Date(2024, 10, 15),
        status: "Pagado",
        ticketDetails: [
          { description: "Detalle 1", amount: 50 },
          { description: "Detalle 2", amount: 30 }
        ]
      },
      {
        id: 2,
        ownerId: 102,
        issueDate: new Date(2024, 9, 20),
        expirationDate: new Date(2024, 10, 20),
        status: "Pendiente",
        ticketDetails: [
          { description: "Detalle 1", amount: 70 },
          { description: "Detalle 2", amount: 40 }
        ]
      },
      {
        id: 3,
        ownerId: 103,
        issueDate: new Date(2024, 8, 10),
        expirationDate: new Date(2024, 9, 10),
        status: "Vencido",
        ticketDetails: [
          { description: "Detalle 1", amount: 60 },
          { description: "Detalle 2", amount: 20 }
        ]
      },
      {
        id: 4,
        ownerId: 104,
        issueDate: new Date(2024, 7, 25),
        expirationDate: new Date(2024, 8, 25),
        status: "Cancelado",
        ticketDetails: [
          { description: "Detalle 1", amount: 80 },
          { description: "Detalle 2", amount: 50 }
        ]
      },
      {
        id: 5,
        ownerId: 105,
        issueDate: new Date(2024, 10, 1),
        expirationDate: new Date(2024, 11, 1),
        status: "Pagado",
        ticketDetails: [
          { description: "Detalle 1", amount: 90 },
          { description: "Detalle 2", amount: 60 }
        ]
      },
      {
        id: 6,
        ownerId: 106,
        issueDate: new Date(2024, 10, 5),
        expirationDate: new Date(2024, 11, 5),
        status: "Pendiente",
        ticketDetails: [
          { description: "Detalle 1", amount: 45 },
          { description: "Detalle 2", amount: 25 }
        ]
      },
      {
        id: 7,
        ownerId: 107,
        issueDate: new Date(2024, 6, 18),
        expirationDate: new Date(2024, 7, 18),
        status: "Vencido",
        ticketDetails: [
          { description: "Detalle 1", amount: 110 },
          { description: "Detalle 2", amount: 50 }
        ]
      },
      {
        id: 8,
        ownerId: 108,
        issueDate: new Date(2024, 9, 25),
        expirationDate: new Date(2024, 10, 25),
        status: "Pagado",
        ticketDetails: [
          { description: "Detalle 1", amount: 95 },
          { description: "Detalle 2", amount: 35 }
        ]
      },
      {
        id: 9,
        ownerId: 109,
        issueDate: new Date(2024, 8, 28),
        expirationDate: new Date(2024, 9, 28),
        status: "Pendiente",
        ticketDetails: [
          { description: "Detalle 1", amount: 70 },
          { description: "Detalle 2", amount: 40 }
        ]
      },
      {
        id: 10,
        ownerId: 110,
        issueDate: new Date(2024, 5, 14),
        expirationDate: new Date(2024, 6, 14),
        status: "Cancelado",
        ticketDetails: [
          { description: "Detalle 1", amount: 85 },
          { description: "Detalle 2", amount: 45 }
        ]
      }
    ] as unknown as TicketDto[];
    if(page == null || size == null){
      this.itemsSubject.next(allItems);
      this.totalItemsSubject.next(allItems.length);
      this.isLoadingSubject.next(false);
      return;
    }
    const startIndex = (page - 1) * size;
    const paginatedItems = allItems.slice(startIndex, startIndex + size);
    this.itemsSubject.next(paginatedItems);
    this.totalItemsSubject.next(allItems.length);
    this.isLoadingSubject.next(false);
  }
  
}
