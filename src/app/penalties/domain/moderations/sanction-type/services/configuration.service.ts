import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import { environment } from '../../../../../../environments/environment';
import {Rules} from '../../../rules/rules';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }

  private httpMethods = inject(HttpClient)

  getDays():Observable<number> {
    return this.httpMethods.get<number>(environment.apis.moderations+"infraction-config/appeal-days")
  }

  putDays(days:number, id:number):Observable<number> {

    const header = new HttpHeaders({
      'x-user-id': id.toString(),
      'Content-Type': 'application/json'});

    return this.httpMethods.put<number>(environment.apis.moderations+`infraction-config/appeal-days?daysToAppeal=${days}`,
      null,
      {headers: header});
  }

  getRules(): Observable<Rules> {
    return this.httpMethods.get<Rules>(environment.apis.moderations + "rules")

  }

  putRules(rules: Rules, id: number): Observable<Rules> {
    const header = new HttpHeaders({
      'userId': id.toString(),
      'Content-Type': 'application/json'
    })

    console.log("header created ", header)

    return this.httpMethods.put<Rules>(
      environment.apis.moderations + "rules",
      rules,
      {headers: header}
    )


  }
}
