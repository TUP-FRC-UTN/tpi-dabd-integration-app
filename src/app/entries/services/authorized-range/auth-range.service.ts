import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthDTO } from '../../models/authorization/authorized-range.model';
import { AccessDTO } from '../../models/accesses/access-record.model';

@Injectable({
  providedIn: 'root',
})
export class AuthRangeService {
  private url = 'https://f81hvhvc-8080.brs.devtunnels.ms/auths';

  constructor(private http: HttpClient) {}

  getAuhtByDocNumber(docNumber: number): Observable<AuthDTO[]> {
    const params = new HttpParams().set('docNumber', docNumber.toString());
    return this.http.get<AuthDTO[]>(this.url, { params });
  }

  getAllAuths() {
    return this.http.get<AuthDTO[]>(this.url);
  }

  authorizeAccess(accessDTO: AccessDTO, userId: number): Observable<AccessDTO> {
    const headers = { 'x-user-id': userId.toString() };
    return this.http.post<AccessDTO>(`${this.url}/authorize`, accessDTO, {
      headers,
    });
  }
}
