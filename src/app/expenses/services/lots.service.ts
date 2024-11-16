import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Lot, { Lots } from '../models/lot';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LotsService {

  constructor() { }
  private readonly http = inject(HttpClient)

  private apiUrl = "https://my-json-server.typicode.com/RamiroRomera/fake_api_plots/plots";
  get(): Observable<Lots[]>{
    return this.http.get<Lots[]>(`${this.apiUrl}`)
    
  }
}
