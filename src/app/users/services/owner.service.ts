import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Owner, OwnerResponse } from '../models/owner';
import { PaginatedResponse } from '../models/api-response';
import { toSnakeCase } from '../utils/owner-helper';
import { OwnerMapperPipe } from '../pipes/owner-mapper.pipe';
import { Document } from '../models/file';

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  private apiUrl = 'http://localhost:8282/owners';

  constructor(private http: HttpClient) {}

  getOwners(
    page: number,
    size: number,
    isActive?: boolean
  ): Observable<PaginatedResponse<Owner>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (typeof isActive === 'boolean' && !isActive) {
      params = params.append('is_active', isActive.toString());
    }

    return this.http
      .get<PaginatedResponse<OwnerResponse>>(this.apiUrl, { params })
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
    return this.http.get<OwnerResponse>(this.apiUrl + `/${ownerId}`).pipe(
      map((data: any) => {
        const transformPipe = new OwnerMapperPipe();
        return transformPipe.transform(data);
      })
    );
  }

  createOwner(ownerData: Owner, userId: string): Observable<Owner | null> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });
    const owner = toSnakeCase(ownerData);
    return this.http.post<Owner>(this.apiUrl, owner, { headers });
  }

  linkOwnerWithPlot(ownerId: number, plotId: number, userId: string) {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });
    
    return this.http.post<Owner>(`http://localhost:8282/owner/${ownerId}/plot/${plotId}`, undefined, { headers });
  }

  updateOwner(
    ownerId: number,
    ownerData: any,
    userId: string
  ): Observable<Owner> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });

    const owner = toSnakeCase(ownerData);
    console.log("Service", owner);
    
    return this.http.put<Owner>(`${this.apiUrl}/${ownerId}`, owner, {
      headers,
    });
  }

  deleteOwner(id: number, userId: string) {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });
    return this.http.delete<any>(this.apiUrl + `/${id}`, { headers });
  }

  getOwnerByDocAndType(docNumber: string, docType: string) {
    const params = new HttpParams()
      .set('document_number', docNumber.toString())
      .set('document_type', docType.toString());
    return this.http.get<any>(this.apiUrl + '/document', { params });
  }

  filterOwnerByDocType(
    page: number,
    size: number,
    docType: string,
    isActive?: boolean
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('doc_type', docType);

    if (typeof isActive === 'boolean' && !isActive) {
      params = params.append('is_active', isActive.toString());
    }
    
    return this.http
      .get<PaginatedResponse<Owner>>(this.apiUrl + '/doctype', { params })
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

    return this.http.get<any>(this.apiUrl + `/${ownerId}/files`).pipe(
      map((response: any) => {
        
        const transformPipe = new OwnerMapperPipe();
        return response.map((file: any) =>
          transformPipe.transformFile(file)
        );
      })
    );
  }






  filterOwnerByOwnerType(
    page: number,
    size: number,
    ownerType: string,
    isActive?: boolean
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('owner_type', ownerType);

    if (typeof isActive === 'boolean' && !isActive) {
      params = params.append('is_active', isActive.toString());
    }
    return this.http
      .get<PaginatedResponse<Owner>>(this.apiUrl + '/type', { params })
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
