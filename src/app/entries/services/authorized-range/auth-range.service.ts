import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthDTO } from '../../models/authorization/authorized-range.model';
import { AccessDTO } from '../../models/accesses/access-record.model';
import { SessionService } from '../../../users/services/session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthRangeService {
  private url = 'http://localhost:8080/auths';

  constructor(private http: HttpClient) {}
  sessionService = inject(SessionService);

  getAuhtByDocNumber(docNumber: number): Observable<AuthDTO[]> {
    const params = new HttpParams().set('docNumber', docNumber.toString());
    return this.http.get<AuthDTO[]>(this.url, { params });
  }

  getAllAuths() {
    return this.http.get<AuthDTO[]>(this.url);
  }

  authorizeAccess(accessDTO: AccessDTO): Observable<AccessDTO> {
    let header = new HttpHeaders();
    const user = this.sessionService.getItem('user');
    const userId = user?.id; // Si user?.id es falsy (null, undefined, etc.), se asigna 1.

    if (!userId) {
      console.error('Error: userId es nulo o undefined');
    }
  
    header = header.set('x-user-id', userId.toString());
  
    return this.http.post<AccessDTO>(`${this.url}/authorize`, accessDTO, {
      headers: header, // Corregir de 'header' a 'headers'
    });
  }
}
