import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OtherReport, PeriodRequest, TicketInfo, Top5, TopPayments } from '../models/stadistics';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService {

  private readonly baseUrl = 'http://localhost:8087/report';
  private readonly baseUrlpayments = 'http://localhost:8090/report/topPayments';

  // Endpoints específicos
  private readonly apiUrl = this.baseUrl;

  constructor(private http: HttpClient) {

  }

  getBaseReport(fechas: PeriodRequest): Observable<Top5> {
    return this.http.post<Top5>(this.apiUrl + '/top5', fechas);
  }

  getOtherReport(fechas: PeriodRequest): Observable<OtherReport> {
    return this.http.post<OtherReport>(this.apiUrl + '/otherReports', fechas);
  }

  getAmountByDate(fechas: PeriodRequest): Observable<TicketInfo[]> {
    return this.http.post<TicketInfo[]>(this.apiUrl + '/totalPayments', fechas);
  }

  getPreferred(fechas: PeriodRequest): Observable<TopPayments> {
    return this.http.post<TopPayments>(this.baseUrlpayments, fechas);
  }

}
