import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {


  host: string = `${environment.production ? `${environment.apis.users}` : `${environment.apis.users}`}authentications`;


  constructor(private http: HttpClient,
    private sessionService: SessionService
  ) {}

  /**
   * Login method that sends a request to the backend authentication controller.
   *
   * @param loginRequest Object containing email and password.
   * @returns Observable<number> Response from the backend indicating login success or failure.
   */
  login(loginRequest: LoginRequest): Observable<number> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<number>(`${this.host}/login`, loginRequest, {
      headers,
    });
  }

   /**
   * Logs out the user by clearing the session.
   */
   logout(): void {
    this.sessionService.logout();
  }


}
