import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Provider} from '../models/provider';
import {PORT} from "../const";

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  private http = inject(HttpClient);
  private url = PORT + "providers?supplierOrEmployeeType=SUPPLIER"

  constructor() { }

  getAllProviders():Observable<Provider[]>{
    try {
      return this.http.get<Provider[]>(this.url)

    } catch (error) {
      throw error;
    }
  }
}
