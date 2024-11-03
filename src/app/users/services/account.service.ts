import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Account, AccountingConcept } from '../models/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient)

  host: string = "http://localhost:8002/accounting-concepts/"

  //page : number, size : number, isActive? : boolean

  getConceptsByPlotId(accoundId : number): AccountingConcept[] {
    return [];
  }
}
