import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthorizedRange } from '../../models/authorization/authorized-range.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorizedRangeService {
  private apiUrl = 'http://localhost:8080/authorized-ranges/register';

  constructor(private http: HttpClient) {}

  registerAuthorizedRange(
    authorizedRange: AuthorizedRange
  ): Observable<AuthorizedRange> {
    return this.http.post<AuthorizedRange>(this.apiUrl, authorizedRange);
  }
}
