import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Owner, OwnerResponse } from '../models/owner';
import { PaginatedResponse } from '../models/api-response';
import { toSnakeCase } from '../utils/owner-helper';
import { OwnerMapperPipe } from '../pipes/owner-mapper.pipe';
import { Document } from '../models/file';
import { Plot } from '../models/plot';
import { TransformPlotPipe } from '../pipes/plot-mapper.pipe';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  private sessionService = inject(SessionService);


  host: string = `${environment.production ? `${environment.apis.cadastre}` : `${environment.apis.cadastre}`}owners`;

  constructor(private http: HttpClient) {}

  getOwners(
    page: number,
    size: number,
    isActive?: boolean
  ): Observable<PaginatedResponse<Owner>> {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString());

    if (typeof isActive === 'boolean' && !isActive) {
      params = params.append('is_active', isActive.toString());
    }

    return this.http
      .get<PaginatedResponse<OwnerResponse>>(this.host, { params })
      .pipe(
        map((response) => {
          const transformPipe = new OwnerMapperPipe();
          const transformedOwners = response.content.map((plot: any) =>
            transformPipe.transform(plot)
          );
          return {
            ...response,
            content: transformedOwners,
          };
        })
      );
  }

  getOwnerById(ownerId: number): Observable<Owner> {
    return this.http.get<OwnerResponse>(this.host + `/${ownerId}`).pipe(
      map((data: any) => {
        const transformPipe = new OwnerMapperPipe();
        return transformPipe.transform(data);
      })
    );
  }

  createOwner(ownerData: Owner): Observable<Owner | null> {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
    });
    const owner = toSnakeCase(ownerData);
    return this.http.post<Owner>(this.host, owner, { headers });
  }

  linkOwnerWithPlot(ownerId: number, plotId: number) {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
    });

    return this.http.post<Owner>(
      `${this.host}/${ownerId}/plot/${plotId}`,
      undefined,
      { headers }
    );
  }

  updateOwner(
    ownerId: number,
    ownerData: any
  ): Observable<Owner> {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
    });

    const owner = toSnakeCase(ownerData);

    return this.http.put<Owner>(`${this.host}/${ownerId}`, owner, {
      headers,
    });
  }

  deleteOwner(id: number) {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
    });
    return this.http.delete<any>(this.host + `/${id}`, { headers });
  }

  getOwnerByDocAndType(docNumber: string, docType: string) {
    const params = new HttpParams()
      .set('document_number', docNumber.toString())
      .set('document_type', docType.toString());
    return this.http.get<any>(this.host + '/document', { params });
  }

  filterOwnerByDocType(
    page: number,
    size: number,
    docType: string,
    isActive?: boolean
  ) {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString())
      .set('doc_type', docType);

    if (typeof isActive === 'boolean' && !isActive) {
      params = params.append('is_active', isActive.toString());
    }

    return this.http
      .get<PaginatedResponse<Owner>>(this.host + '/doctype', { params })
      .pipe(
        map((response) => {
          const transformPipe = new OwnerMapperPipe();
          const transformedOwners = response.content.map((plot: any) =>
            transformPipe.transform(plot)
          );
          return {
            ...response,
            content: transformedOwners,
          };
        })
      );
  }

  // metodo para traer los archivos del owner por id de owner
  getOwnerFilesById(ownerId: number): Observable<Document[]> {
    let params = new HttpParams().set('is-active', true);

    return this.http
      .get<any>(this.host + `/${ownerId}/files`, { params })
      .pipe(
        map((response: any) => {
          const transformPipe = new OwnerMapperPipe();
          return response.map((file: any) => transformPipe.transformFile(file));
        })
      );
  }

  // agregar el metodo para actualizar el KYC status del owner
  validateOwner(ownerId: number, plotId: number, status: any): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
    });

    const change = {
      owner_id: ownerId,
      plot_id: plotId,
      kyc_status: status,
      roles: [102],
    };

    return this.http.post<any>(this.host + `/validate`, change, { headers });
  }

  filterOwnerByOwnerType(
    page: number,
    size: number,
    ownerType: string,
    isActive?: boolean
  ) {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString())
      .set('owner_type', ownerType);

    if (typeof isActive === 'boolean' && !isActive) {
      params = params.append('is_active', isActive.toString());
    }
    return this.http
      .get<PaginatedResponse<Owner>>(this.host + '/type', { params })
      .pipe(
        map((response) => {
          const transformPipe = new OwnerMapperPipe();
          const transformedOwners = response.content.map((plot: any) =>
            transformPipe.transform(plot)
          );
          return {
            ...response,
            content: transformedOwners,
          };
        })
      );
  }

  dinamicFilters(page: number, size: number, params: any) {
    let httpParams = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString());

    for (const key in params) {
      if (
        params.hasOwnProperty(key) &&
        params[key] !== undefined &&
        params[key] !== ''
      ) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    }

    return this.http
      .get<PaginatedResponse<Owner>>(`${this.host}/filters`, {
        params: httpParams,
      })
      .pipe(
        map((response) => {
          const transformPipe = new OwnerMapperPipe();
          const transformedOwners = response.content.map((plot: any) =>
            transformPipe.transform(plot)
          );
          return {
            ...response,
            content: transformedOwners,
          };
        })
      );
  }
}
