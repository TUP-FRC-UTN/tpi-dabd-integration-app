import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SendVisitor, Visitor } from '../../models/visitors/visitor.model';
import { CaseTransformerService } from '../case-transformer.service';
import { environment } from '../../../../environments/environment.prod';

export interface VisitorFilter {
  active?: boolean;
  textFilter?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalElements: number;
}

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  //private apiUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/visitors';
 // private baseUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/';

//  private urlEnvironment = environment.apis.accesses; //8080

  //si la variable de produccion es true, entonces se usa la url de produccion (eso lo indica la importacion de environment.prod.ts)
  private apiUrl: string = environment.production
  ? `${environment.apis.accesses}`
  : 'http://localhost:8001/';


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
    userId: number,
    visitorId?: number
  ): Observable<HttpResponse<Visitor>> {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString(),
    });

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

  enable(visitorId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString(),
    });

    return this.http
      .put<any>(`${this.apiUrl}visitors/${visitorId}/activate`, null, {
        headers,
      })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  delete(visitorId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString(),
    });

    return this.http
      .delete<any>(`${this.apiUrl}visitors/${visitorId}`, { headers })
      .pipe(map((response) => response));
  }
}
