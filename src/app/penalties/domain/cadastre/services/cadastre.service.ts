import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Page } from '../../../shared/models/page.model';
import { Plot } from '../plot/models/plot.model';

@Injectable({
  providedIn: 'root'
})
export class CadastreService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8081';

  getPlots() {
    let params = new HttpParams().set('page', 0).set('size', 20000);
    

    return this.http.get<Page<Plot>>(`${this.apiUrl}/plots`, {
      params,
    });
  }
}
