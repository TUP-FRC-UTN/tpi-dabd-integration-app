import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SendVisitor, Visitor } from '../../models/visitors/visitor.model';

interface PaginatedResponse<T> {
  items: T[];
  total_elements: number;
}

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  private apiUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/visitors';
  private baseUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/';

  constructor(private http: HttpClient) {}

  getVisitors(page: number = 0, size: number = 10 , filter?: string): Observable<PaginatedResponse<Visitor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // if (name) {
    //   params = params.set('name', name);
    // }
    // if (lastName) {
    //   params = params.set('lastName', lastName);
    // }
    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<PaginatedResponse<Visitor>>(this.apiUrl, { params });
  }

  getVisitor(visitorId: number): Observable<Visitor> {
    return this.http.get<Visitor>(`${this.apiUrl}/${visitorId}`);
  }

  deleteVisitor(visitorId: number): Observable<Visitor> {
    return this.http.delete<Visitor>(`${this.apiUrl}/${visitorId}`);
  }

  upsertVisitor(visitor: SendVisitor): Observable<Visitor> {
    return this.http.put<Visitor>(this.apiUrl, visitor);
  }
}
