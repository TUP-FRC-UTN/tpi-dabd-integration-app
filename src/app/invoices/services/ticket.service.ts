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
    // Base URL para el servicio de tickets
  private readonly baseUrl = 'http://localhost:8087/tickets';

  // Endpoints específicos
  private readonly apiUrl = this.baseUrl;
  private readonly apiUrlPdf = this.baseUrl + '/generateTicket/';
  private readonly apiGetAllByOwner = this.baseUrl + '/getAllTicketsByOwner';
  private readonly apiGetAll = this.baseUrl + '/getAll';
    

    constructor(private http: HttpClient) { }

    filtrarfechas(dtobusqueda: any): Observable<any> {
      return this.http.post<any>(this.apiUrl + '/search', dtobusqueda);
    }



    getAllTicketsContent(): Observable<TicketDto[]> {
      return this.http.get<{ content: TicketDto[] }>( this.baseUrl + '/tickets/getAll').pipe(
        map(response => response.content) // Extrae solo content del objeto de respuesta
      );
    }
    

    getAll(page : number, size : number): Observable<PaginatedResponse<TicketDto>> {
      let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
        
      return this.http.get<PaginatedResponse<TicketDto>>(this.apiGetAll, { params }).pipe(
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

    // filterTicketByStatus(page : number, size : number, plotType : string) {
    //   let params = new HttpParams()
    //   .set('ownerId', 1)
    //   .set('status', 'PAID')
    //   .set('page', page.toString())
    //   .set('size', size.toString());
    
    //   return this.http.get<PaginatedResponse<TicketDto>>(this.apiGetAllByOwner, { params }).pipe(
    //     map((response: PaginatedResponse<any>) => {
    //       const transformPipe = new TransformTicketPipe();
    //       const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
    //       return {
    //         ...response,
    //         content: transformedPlots 
    //       };
    //     })
    //   );
    // }

    // getAllForPDFUser()

    getAllByOwner(page : number, size : number): Observable<PaginatedResponse<TicketDto>> {
      let params = new HttpParams()
      .set('ownerId', 1)
      .set('page', page.toString())
      .set('size', size.toString());
        
      return this.http.get<PaginatedResponse<TicketDto>>(this.apiGetAllByOwner, { params }).pipe(
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

    getAllByOwnerWithFilters(page : number, size : number, status?:string): Observable<PaginatedResponse<TicketDto>> {
      let params = new HttpParams()
      .set('ownerId', 1)
      .set('page', page.toString())
      .set('size', size.toString());
        

      if (status) {
        params = params.set('status', status);
      }
      return this.http.get<PaginatedResponse<TicketDto>>(this.apiGetAllByOwner, { params }).pipe(
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

    getAllTicketsPageForExports(page : number, size : number): Observable<PaginatedResponse<TicketDto>> {
      const ownerId = 1;
      let params = new HttpParams()
      .set('ownerId', ownerId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
      return this.http.get<PaginatedResponse<TicketDto>>(this.apiGetAll, { params }).pipe(
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

  getAllWithFilters(page: number, size: number, status?: string, lotId?:string, firstPeriod?: string, lastPeriod?: string): Observable<PaginatedResponse<TicketDto>> {
    let params = new HttpParams();
      // .set('page', page.toString()) //comentamos para el filtro del controlador
      // .set('size', size.toString());
    if (status) {
      params = params.set('status', status);
    }
    if (firstPeriod) {
      params = params.set('firstPeriod', firstPeriod);
    }
    if (lastPeriod) {
      params = params.set('lastPeriod', lastPeriod);
    }

    return this.http.get<PaginatedResponse<TicketDto>>(this.apiGetAll, { params }).pipe(
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




  updateTicketStatus(id: number, status: string): Observable<TicketDto> {
    const url = `${this.baseUrl}/updateTicketStatus/${id}`;
    const params = new HttpParams().set('status', status);
    return this.http.put<TicketDto>(url, null, { params });
  }

}
