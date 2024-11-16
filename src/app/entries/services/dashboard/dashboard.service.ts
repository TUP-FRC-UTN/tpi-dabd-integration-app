import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import { DashBoardFilters } from '../../models/dashboard/dashboard.model';
import { environment } from '../../../../environments/environment.prod';


export interface dashResponse{
  key:string,
  value:string
  secondary_value : string
}

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  //private apiUrl = 'http://localhost:8001/access'; // esta es la url de desarrollo local
  //private apiProduction = environment.apis.accesses+'access';

  //si la variable de produccion es true, entonces se usa la url de produccion (eso lo indica la importacion de environment.prod.ts)
  private apiUrl: string = environment.production
  ? `${environment.apis.accesses}access`
  : 'http://localhost:8001/access';

  constructor(
    private http: HttpClient,
  ) {}

  getPeriod(dashBoardFilters: DashBoardFilters): Observable<dashResponse[]> {
    let url = `${this.apiUrl}/period?from=${dashBoardFilters.dateFrom}&to=${dashBoardFilters.dateTo}&actionTypes=${dashBoardFilters.action}&group=${dashBoardFilters.group}`;

    if (dashBoardFilters.type) {
      url += `&visitorType=${dashBoardFilters.type}`;
    }

    if (!dashBoardFilters.dataType) {
      dashBoardFilters.dataType = "ALL"
    }

    url += `&dataType=${dashBoardFilters.dataType}`;

    return this.http.get<dashResponse[]>(url);
  }


  getTypes(dashBoardFilters: DashBoardFilters): Observable<dashResponse[]> {
    let url = `${this.apiUrl}/visitor/type?from=${dashBoardFilters.dateFrom}&to=${dashBoardFilters.dateTo}`;

    if (dashBoardFilters.type) {
      url += `&visitorType=${dashBoardFilters.type}`;
    }

    return this.http.get<dashResponse[]>(url);
  }
}
