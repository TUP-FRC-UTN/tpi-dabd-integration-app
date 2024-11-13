import {Inject, Injectable} from '@angular/core';
import {PORT} from "../../const";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ReportPeriod} from "../../models/report-period/report-period";

@Injectable({
  providedIn: 'root'
})
export class ReportPeriodService {

  private apiUrl = PORT +'report/period';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el reporte para un conjunto de periodos
   * @param ids Array de ids de los periodos que quieres consultar
   * @returns Observable de ReportPeriod
   */
  getReportPeriods(ids: number[]): Observable<ReportPeriod> {
    try {
      let params = new HttpParams();
      ids.forEach(id => {
        params = params.append('ids', id.toString());
      });
      return this.http.get<ReportPeriod>(this.apiUrl, { params });

    } catch (error){
      throw error;
    }
  }
}

