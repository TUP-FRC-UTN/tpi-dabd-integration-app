import { CategoryCharge, Charge } from './../models/charge';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PORT } from '../const';

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChargeService {
  private http = inject(HttpClient);
  private categoryChargeUrl = `${PORT}category-charges`;
  private apiUrl = `${PORT}charges`
  constructor() {}

  addCharge(charge: Charge): Observable<Charge> {
    return this.http.post<Charge>(this.apiUrl, charge);
  }

  getChargesAll(): Observable<Charge[]> {
    return this.http.get<Charge[]>(this.apiUrl);
  }

  getCharges(page: number, size: number, periodId?: number, plotId?: number, typeId?: number): Observable<Page<Charge>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (periodId != undefined || periodId != null ) {
      if(periodId != 0){
        console.log('periodo = '+periodId);
        params = params.set('period', periodId.toString());
      }      
    }
    // if (plotId) {
    //   console.log('lote= '+plotId)
    //   params = params.set('plotId', plotId);
    // }
    if (typeId != undefined || typeId != null) {
      if(typeId != 0){
        console.log('categoria = '+typeId);
        params = params.set('type', typeId.toString());
      }
    }
    console.log(params);
    return this.http.get<Page<Charge>>(this.apiUrl, { params });
    /*
    .pipe(
      map(page => {
        // Accede a `content` y asigna valores predeterminados si es necesario
        page.content = page.content.map(charge => ({
          ...charge,
          period: charge.period || { month: 0, year: 0, state: 'UNKNOWN', id: 0 }
        }));
        return page;
      })
    )
    */
  }

  updateCharge(charge: Charge): Observable<Charge> {
    debugger
    return this.http.put<Charge>(`${this.apiUrl}/${charge.chargeId}`, charge);
  }  

  deleteCharge(charge: number): Observable<Boolean> {
    return this.http.delete<Boolean>(this.apiUrl + '/' + charge);
    //return this.http.put<Charge>(`${this.apiUrl}/${charge.charge_id}`, charge);
  }

  deleteCharge2(charge: number): Observable<Charge> {
    return this.http.delete<Charge>(this.apiUrl + '/' + charge);
  }




  createCharge(charge: Charge): Observable<Charge> {
    return this.http.post<Charge>(this.apiUrl, charge);
  }

  getCategoryCharges(): Observable<CategoryCharge[]> {
    return this.http.get<CategoryCharge[]>(this.categoryChargeUrl);
  }


}
