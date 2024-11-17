import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SendVisitor, Visitor } from '../../models/visitors/visitor.model';
import { CaseTransformerService } from '../case-transformer.service';
import { environment } from '../../../../environments/environment.prod';
import { SessionService } from '../../../users/services/session.service';

export interface VisitorFilter {
  active?: boolean;
  textFilter?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalElements: number;
}

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
 
  //si la variable de produccion es true, entonces se usa la url de produccion (eso lo indica la importacion de environment.prod.ts)
  private apiUrl: string = environment.production
  ? `${environment.apis.accesses}`
  : 'http://localhost:8001/';

  sessionService = inject(SessionService)

  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  getAll(
    page: number,
    size: number,
    filter?: boolean
  ): Observable<{ items: Visitor[] }> {
    
    const params = this.caseTransformer.toSnakeCase({
      page,
      size,
      filter,
    });

    return this.http
      .get<{ items: Visitor[] }>(this.apiUrl + 'visitors', {
        params: params as any,
      })
      .pipe(
        map((response) => ({
          items: response.items.map((item) =>
            this.caseTransformer.toCamelCase(item)
          ),
        }))
      );
  }

  getAllPaginated(
    page?: number,
    size?: number,
    filter?: VisitorFilter
  ): Observable<PaginatedResponse<Visitor>> {
    let snakeCaseParams = this.caseTransformer.toSnakeCase({
      page: page?.toString(),
      size: size?.toString(),
      filter,
    });

    return this.http
      .get<{ items: Visitor[]; total_elements: number }>(
        this.apiUrl + 'visitors',
        { params: snakeCaseParams as any }
      )
      .pipe(
        map((response) => {
          return {
            items: response.items.map((item) =>
              this.caseTransformer.toCamelCase(item)
            ),
            totalElements: response.total_elements,
          };
        })
      );
  }

  getAllFiltered(filter: string): Observable<PaginatedResponse<Visitor>> {
    // Definir un objeto de parámetros solo con el filtro de texto
    const filterParams = { textFilter: filter };

    // Llamada al backend con los parámetros de filtro y sin la paginación
    return this.http
      .get<{ items: Visitor[]; total_elements: number }>(
        this.apiUrl + 'visitors',
        { params: filterParams }
      )
      .pipe(
        map((response) => {
          return {
            items: response.items.map(
              (item) => this.caseTransformer.toCamelCase(item) // Convertir a camelCase si es necesario
            ),
            totalElements: response.total_elements,
          };
        })
      );
  }

  getVisitor(docNumber: number): Observable<HttpResponse<Visitor>> {
    return this.http
      .get<Visitor>(
        `${this.apiUrl}visitors/by-doc-number/${docNumber}`,
        {
          observe: 'response',
        }
      )
      .pipe(
        map(
          (response) =>
            new HttpResponse({
              body: response.body
                ? this.caseTransformer.toCamelCase(response.body)
                : null,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url || undefined,
            })
        )
      );
  }

  getVisitorById(visitorId: number): Observable<HttpResponse<Visitor>> {
    return this.http
      .get<Visitor>(`${this.apiUrl}visitors/${visitorId}`, {
        observe: 'response',
      })
      .pipe(
        map(
          (response) =>
            new HttpResponse({
              body: response.body
                ? this.caseTransformer.toCamelCase(response.body)
                : null,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url || undefined,
            })
        )
      );
  }

  upsertVisitor(
    visitor: SendVisitor,
    visitorId?: number
  ): Observable<HttpResponse<Visitor>> {

    let headers = new HttpHeaders();
    const user = this.sessionService.getItem('user');

    if(!user) {
      console.error('Error: user es nulo o undefined');
    }else{
      headers = headers.set('x-user-id', user.id.toString());
    }
    

    const snakeCaseVisitor = this.caseTransformer.toSnakeCase(visitor);
    let params = new HttpParams();

    if (visitorId) {
      params = params.set('visitorId', visitorId.toString()); // Asignar el resultado de `set` a `params`
    }

    console.log('params: ', params.toString()); // Verificar qué parámetros se están enviando

    return this.http
      .put<Visitor>(this.apiUrl + 'visitors', snakeCaseVisitor, {
        observe: 'response',
        headers,
        params,
      })
      .pipe(
        map(
          (response) =>
            new HttpResponse({
              body: response.body
                ? this.caseTransformer.toCamelCase(response.body)
                : null,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url || undefined,
            })
        )
      );
  }

  checkAccess(plate: string, action: string): Observable<Boolean> {
    const params = new HttpParams()
      .set('carPlate', plate)
      .set('action', action);

    return this.http.get<Boolean>(`${this.apiUrl}access/check-access`, {
      params,
    });
  }

  enable(visitorId: number): Observable<any> {
    let headers = new HttpHeaders();
    const user = this.sessionService.getItem('user');

    if(!user) {
      console.error('Error: user es nulo o undefined');
    }else{
      headers = headers.set('x-user-id', user.id.toString());
    }

    return this.http
      .put<any>(`${this.apiUrl}visitors/${visitorId}/activate`, null, {headers})
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  delete(visitorId: number): Observable<any> {
    let headers = new HttpHeaders();
    const user = this.sessionService.getItem('user');

    if(!user) {
      console.error('Error: user es nulo o undefined');
    }else{

      headers = headers.set('x-user-id', user.id.toString());
      console.log(headers.get('x-user-id') +" header user id");
    }

    return this.http
      .delete<any>(`${this.apiUrl}visitors/${visitorId}`, { headers })
      .pipe(map((response) => response));
  }
}
