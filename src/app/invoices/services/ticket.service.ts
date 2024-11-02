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

  
  
}
