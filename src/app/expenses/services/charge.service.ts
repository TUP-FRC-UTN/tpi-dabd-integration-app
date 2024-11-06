import { CategoryCharge, Charge, ChargeType } from './../models/charge';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PORT } from '../const';
import Category from '../models/category';

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
    const headers = new HttpHeaders({
      'x-user-id': '1'
    });
    return this.http.post<Charge>(this.apiUrl, charge, { headers });
  }

  getChargesAll(): Observable<Charge[]> {
    return this.http.get<Charge[]>(this.apiUrl);
  }

  getCharges(page: number, size: number, periodId?: number, plotId?: number, categoryId?: number,type?: ChargeType): Observable<Page<Charge>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (periodId != undefined || periodId != null ) {
      if(periodId != 0){
        console.log('periodo = '+periodId);
        params = params.set('period', periodId.toString());
      }      
    }
    if(plotId != undefined || plotId != null ){
      if (plotId) {
        console.log('lote= '+plotId)
        params = params.set('lot', plotId);
      }
    }
    
    if (categoryId != undefined || categoryId != null) {
      if(categoryId != 0){
        console.log('categoria = '+categoryId);
        params = params.set('category', categoryId.toString());
      }
    }
    
    if (type != undefined || type != null) {     
      let tipo = '';
      switch(type){
        case 'Positivo': tipo = 'ABSOLUTE'; break;
        case 'Porcentaje': tipo ='PERCENTAGE'; break;
        case 'Negativo': tipo = 'NEGATIVE'; break;
        default : tipo = 'ABSOLUTE'; break;

      } 
      console.log('tipo SIGN ES '+tipo);
      params = params.set('type', tipo);
      
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
    const headers = new HttpHeaders({
      'x-user-id': '1'
    });
    return this.http.put<Charge>(`${this.apiUrl}/${charge.chargeId}`, charge, {headers});
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

  getCategoriesExcFines() : Observable<CategoryCharge[]> {
    return this.http.get<CategoryCharge[]>(`${this.categoryChargeUrl}/exceptFines`);
  }


}
