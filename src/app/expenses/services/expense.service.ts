import { inject, Injectable } from '@angular/core';
import Expense from '../models/expense';
import Period from '../models/period';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PORT } from '../const';

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseServiceService {

  constructor() { }
  private readonly http = inject(HttpClient)
  private apiUrl = `${PORT}expense/`
  getExpenses(page: number, size: number, periodId?: number, plotId?: number, typeId?: number, sortField?: string, sortOrder?: string): Observable<Page<Expense>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    // Parámetros adicionales 
    if (periodId !== undefined && periodId !== 0) {
      params = params.set('periodId', periodId.toString());
    }
    if(periodId == 0) {
      params = params.delete('periodId')
    }
    if (plotId !== null && plotId !== undefined && plotId !== 0) {
      params = params.set('plotId', plotId.toString());
    }
    if(plotId == 0) {
      params = params.delete('plotId')
    }
    if (typeId !== null && typeId !== undefined && typeId !== 0) {
      params = params.set('typeId', typeId.toString());
    }
    if(typeId == 0) {
      params = params.delete('typeId')
    }
   
    if (sortField) {
      params = params.set('sort', `${sortField},${sortOrder}`);
    }
    return this.http.get<Page<Expense>>(this.apiUrl + 'all', { params });
  }
  getByPeriod(periodId:number):Observable<Expense[]>{
    //calcular y recuperar lista de expensas de un periodo
    return this.http.post<Expense[]>(`${this.apiUrl}create/${periodId}`,null)
  }
}
