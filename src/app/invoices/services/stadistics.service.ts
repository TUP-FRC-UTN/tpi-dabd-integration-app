import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OtherReport, PeriodRequest, TicketInfo, Top5, TopPayments } from '../models/stadistics';
import { PaymentReportDto } from '../models/payments.report.model';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService {

  private readonly baseUrl = 'http://localhost:8087/report';
  private readonly baseUrlpayments = 'http://localhost:8092/report/topPayments';
  private readonly baseUrlpaymentsReport = 'http://localhost:8092/report';

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

  getPreferredApproved(fechas: PeriodRequest): Observable<TopPayments> {
    console.log(fechas);
    
    return this.http.post<TopPayments>(this.baseUrlpaymentsReport + '/topPaymentsApproved', fechas);
  }

  getPreferredRejected(fechas: PeriodRequest): Observable<TopPayments> {
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

}
