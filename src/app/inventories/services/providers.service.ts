import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  //private apiUrl = 'http://localhost:3000/suppliers';
  private apiUrl = 'http://localhost:8013/suppliers';

  constructor(private http: HttpClient) {}

  getProviders(filters?: {
    name?: string,
    cuil?: string,
    service?: string,
    addressId?: number,
    enabled?: boolean,
    phoneNumber?: string
  }): Observable<Supplier[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }
    
    return this.http.get<Supplier[]>(this.apiUrl, { params });
  }

  getProviderById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  addProvider(provider: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, provider);
  }
  
  updateProvider(provider: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(this.apiUrl, provider);
  }

  deleteProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
