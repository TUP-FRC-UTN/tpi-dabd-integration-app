import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AccessRecordResponse } from '../../models/accesses/access-record.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AccessModel } from '../../models/accesses/access.model';
import { CaseTransformerService } from '../case-transformer.service';
import {
  DashboardHourlyDTO,
  DashboardWeeklyDTO,
  EntryReport,
} from '../../models/dashboard.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  //private apiUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/access';
  private apiUrl = environment.apis.accesses + 'access';

  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  getAll(
    page: number,
    size: number,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    return this.http
      .get<{ items: AccessModel[] }>(this.apiUrl, {
        params: { size: 1000000 },
      })
      .pipe(
        map((response) => ({
          //items: this.caseTransformer.toCamelCase(response.items),
          items: response.items.map((item) =>
            this.caseTransformer.toCamelCase(item)
          ),
        }))
      );
  }

  createAccess(data: any, userId: string): Observable<AccessModel> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });

    const snakeCaseData = this.caseTransformer.toSnakeCase(data);

    return this.http
      .post<AccessModel>(this.apiUrl + '/' + 'authorize', snakeCaseData, {
        headers,
      })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getByAction(
    page: number,
    size: number,
    type: string,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    return this.http.get<{ items: AccessModel[] }>(this.apiUrl).pipe(
      map((response) => ({
        items: response.items.map((item) =>
          this.caseTransformer.toCamelCase(item)
        ),
      }))
    );
    /*.pipe(
        map((response) =>
          this.caseTransformer.toCamelCase(response)
      ));*/
  }

  getByType(
    page: number,
    size: number,
    type: string,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    return this.http.get<{ items: AccessModel[] }>(this.apiUrl).pipe(
      map((response) => ({
        items: response.items.map((item) =>
          this.caseTransformer.toCamelCase(item)
        ),
      }))
    );
    //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getHourlyAccesses(
    from: string,
    to: string
  ): Observable<DashboardHourlyDTO[]> {
    return this.http
      .get<DashboardHourlyDTO[]>(`${this.apiUrl}/hourly`, {
        params: { from, to },
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
    //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getWeeklyAccesses(
    from: string,
    to: string
  ): Observable<DashboardWeeklyDTO[]> {
    return this.http
      .get<DashboardWeeklyDTO[]>(`${this.apiUrl}/weekly`, {
        params: { from, to },
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
    //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getVisitorTypeAccesses(
    from: string,
    to: string
  ): Observable<DashboardWeeklyDTO[]> {
    return this.http
      .get<DashboardWeeklyDTO[]>(`${this.apiUrl}/visitor/type`, {
        params: { from, to },
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
    //.pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getAccessByDate(from: string, to: string): Observable<EntryReport> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http
      .get<EntryReport>(`${this.apiUrl}/getAccessCounts`, {
        params,
      })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }
}
