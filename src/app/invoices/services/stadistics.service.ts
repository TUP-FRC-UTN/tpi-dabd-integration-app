import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OtherReport, TicketFilter, TicketInfo, Top5, TopPayments } from '../models/stadistics';
import { PaymentReportDto } from '../models/payments.report.model';
import { TicketReportDto } from '../models/ticket.report.model';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService {

  private readonly baseUrl = 'http://localhost:8087/report';
  private readonly baseUrlTicket = 'http://localhost:8087/tickets';
  private readonly baseUrlpayments = 'http://localhost:8092/report/topPayments';
  private readonly baseUrlpaymentsReport = 'http://localhost:8092/report';

  // Endpoints específicos
  private readonly apiUrl = this.baseUrl;

  constructor(private http: HttpClient) {

  }

  getBaseReport(fechas: TicketFilter): Observable<Top5> {
    return this.http.post<Top5>(this.apiUrl + '/top5', fechas);
  }

  getOtherReport(fechas: TicketFilter): Observable<OtherReport> {
    return this.http.post<OtherReport>(this.apiUrl + '/otherReports', fechas);
  }

  getAmountByDate(fechas: TicketFilter): Observable<TicketInfo[]> {
    return this.http.post<TicketInfo[]>(this.apiUrl + '/totalPayments', fechas);
  }

  getPreferredApproved(fechas: TicketFilter): Observable<TopPayments> {
    console.log(fechas);

    return this.http.post<TopPayments>(this.baseUrlpaymentsReport + '/topPaymentsApproved', fechas);
  }

  getPreferredRejected(fechas: TicketFilter): Observable<TopPayments> {
    return this.http.post<TopPayments>(this.baseUrlpaymentsReport + '/topPaymentsRejected', fechas);
  }

  getDinamycFilters(filters: any) {
    let httpParams = new HttpParams()

    for (const key in filters) {
      if (filters.hasOwnProperty(key) && filters[key] !== undefined && filters[key] !== '') {
        httpParams = httpParams.set(key, filters[key].toString());
      }
    }

    return this.http.get<PaymentReportDto[]>(this.baseUrlpaymentsReport + '/filters');
  }

  getDinamycFilterTickets(filters: any) : Observable<TicketReportDto[]> {

    // ESTO CAUSA EL CICLO WHILE ???
    // if (filters.startExpirationDate != null && filters.endExpirationDate != null) {
    //   filters.startExpirationDate = filters.startExpirationDate + '-01';
    //   filters.endExpirationDate = filters.endExpirationDate + '-01';
    // }

    let params = new HttpParams()
    for (const key in filters) {
      if (filters.hasOwnProperty(key) && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key].toString());
      }
    }
    return this.http.get<TicketReportDto[]>(this.baseUrlTicket + '/filters', {params});
  }

}
