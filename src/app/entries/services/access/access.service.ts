import { inject, Injectable } from '@angular/core';
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
import { PaginatedResponse } from '../../paginated-response.model';
import { SessionService } from '../../../users/services/session.service';

@Injectable({
  providedIn: 'root',
})
export class AccessService {

  //si la variable de produccion es true, entonces se usa la url de produccion (eso lo indica la importacion de environment.prod)
  private apiUrl: string = environment.production
  ? `${environment.apis.accesses}access`
  : 'http://localhost:8001/access';
 
  sessionService = inject(SessionService);

  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  getAll(
    page: number,
    size: number,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    const currentUser = this.sessionService.getItem('user');
    
    if (!currentUser || !currentUser?.roles) {
      return new Observable(subscriber => subscriber.next({ items: [] }));
    }

    const isOwner = currentUser.roles.some((role: { name: string; }) => role.name === 'OWNER');
    return this.http
      .get<{ items: AccessModel[] }>(this.apiUrl, {
        params: { size: 1000000 },
      })
      .pipe(
        map((response) => {
          let items = response.items.map((item) =>
            this.caseTransformer.toCamelCase(item)
          );

          console.log(items)
          if (isOwner) {
            items = items.filter(item => item.authorizerId === currentUser.id);
          }
          return { items };
        })
      );
  }

  createAccess(data: any): Observable<AccessModel> {
    const user = this.sessionService.getItem('user');
    
    if(!user) {
      console.error('Error: user es nulo o undefined');
    }
    
    const headers = new HttpHeaders({
      'x-user-id': user.id.toString(),
    });

    const snakeCaseData = this.caseTransformer.toSnakeCase(data);

    return this.http
      .post<AccessModel>(`${this.apiUrl}/authorize`, snakeCaseData, { headers })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getByAction(
    page: number,
    size: number,
    type: string,
    isActive?: boolean
  ): Observable<{ items: AccessModel[] }> {
    const currentUser = this.sessionService.getItem('user');
    const isOwner = currentUser?.roles?.some((role: { name: string; }) => role.name === 'OWNER');

    return this.http.get<{ items: AccessModel[] }>(this.apiUrl).pipe(
      map((response) => {
        let items = response.items.map((item) =>
          this.caseTransformer.toCamelCase(item)
        );

        if (isOwner) {
          items = items.filter(item => item.authorizerId === currentUser.id);
        }

        return { items };
      })
    );
  }

  getByType(visitorType?: string): Observable<PaginatedResponse<AccessModel>> {
    const currentUser = this.sessionService.getItem('user');
    const isOwner = currentUser?.roles?.some((role: { name: string; }) => role.name === 'OWNER');
    
    let params = new HttpParams();
    if (visitorType) params = params.set('visitorType', visitorType);
  
    return this.http.get<{ items: AccessModel[], total_elements: number }>(this.apiUrl, { params })
      .pipe(
        map((response) => {
          let items = response.items.map(item => this.caseTransformer.toCamelCase(item));
          
          if (isOwner) {
            items = items.filter(item => item.authorizerId === currentUser.id);
          }
          
          return {
            totalElements: items.length, 
            items: items,
          };
        })
      );
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
      .get<EntryReport>(`${this.apiUrl}/counts`, {
        params,
      })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }
}
