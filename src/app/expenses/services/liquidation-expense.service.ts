import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import LiquidationExpense from '../models/liquidationExpense';
import { PORT } from '../const';

@Injectable({
  providedIn: 'root',
})
export class LiquidationExpenseService {
  private readonly http = inject(HttpClient);

  private apiUrl = `${PORT}liquidation/`;

  get(id:number): Observable<LiquidationExpense[]>{
    return this.http.get<LiquidationExpense[]>(`${this.apiUrl}calculate/${id}`,)
  }
  getById(id: number): Observable<LiquidationExpense> {
    return this.http.get<LiquidationExpense>(`${this.apiUrl}find/${id}`);
  }

  putCloseLiquidation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}close/${id}`, null);
  }

  putCloseLiquidationExpensesPeriod(id: number): Observable<any> {
    return this.http.put(
      `${PORT}calculate/close/liquidation/${id}`,
      null
    );
  }
}
