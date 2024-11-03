import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccountingConcept } from '../models/account';
import { map, Observable } from 'rxjs';
import { PaginatedResponse } from '../models/api-response';
import { AccountingConceptMapperPipe } from '../pipes/accounting-concept-mapper.pipe';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient)

  host: string = "http://localhost:8002/accounting-concepts/"

  //page : number, size : number, isActive? : boolean

  getConceptsByPlotId(plotId : number, page: number, pageSizeize: number): Observable<PaginatedResponse<AccountingConcept>> {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSizeize.toString());

    return this,this.http.get<PaginatedResponse<AccountingConcept>>(this.host + plotId, {params}).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new AccountingConceptMapperPipe();
        const transformedConcepts = response.content.map((concept: any) => transformPipe.transform(concept));
        return {
          ...response,
          content: transformedConcepts
        }
      })
    );
  }
}
