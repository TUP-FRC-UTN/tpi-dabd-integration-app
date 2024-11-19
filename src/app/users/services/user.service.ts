import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PaginatedResponse } from '../models/api-response';
import { UserMapperPipe } from '../pipes/user-mapper.pipe';
import { toCamelCase } from '../utils/owner-helper';
import { Owner } from '../models/owner';
import { OwnerMapperPipe } from '../pipes/owner-mapper.pipe';
import { ForgotPasswordRequest } from '../models/forgot-password';
import { environment } from '../../../environments/environment'
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient)
  private sessionService = inject(SessionService);

  host: string = `${environment.production ? `${environment.apis.users}` : `${environment.apis.users}`}users`;

  validateEmail(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email.toString());

    return this.http.get<boolean>(this.host + `/validEmail`, { params });
  }

  updateUser(id: number, user: User): Observable<User> {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
      "Accept": "application/json"
    });
    delete user.id;

    return this.http.put<User>(`${this.host}/${id}`, user, { headers });
  }

  deleteUser(id: number) {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });

    return this.http.delete<any>(`${this.host}/${id}`, { headers });
  }

  addUser(user: User): Observable<User> {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
      "Accept": "application/json"
    });

    return this.http.post<User>(`${this.host}`, user, { headers });
  }


  forgotPassword(forgotRequest: ForgotPasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.host}/password/reset`, forgotRequest)

  }

  changePassword(oldPassword: string, newPassword: string):Observable<any> {

    let changePasswordRequest = {
      user_id: this.sessionService.getItem('user').id.toString(),
      old_password:oldPassword,
      new_password: newPassword
    }

    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });


    return this.http.put<any>(`${this.host}/password/change`, changePasswordRequest, {headers})

  }


  getAllUsers(page: number, size: number, isActive?: boolean) {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString());

    if (isActive !== undefined) {
      params = params.append('active', isActive.toString());
    }

    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });
    return this.http.get<PaginatedResponse<User>>(this.host, { params, headers }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformedUser = response.content.map((user: any) =>
          toCamelCase(user)
        );
        return {
          ...response,
          content: transformedUser,
        };
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.host}/${id}`).pipe(
      map((data: any) => {
        return toCamelCase(data);
      })
    );
  }

  /**
   * Obtiene un usuario por ID utilizando HttpClient.
   * Retorna un Observable con los datos del usuario o un error.
   *
   * @param id El ID del usuario a buscar.
   * @returns Observable con los datos del usuario.
   */
  getUserById2(id: number): Observable<User> {
    return this.http.get<User>(`${this.host}/${id}`).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  getUsersCreatedBy(id: string, size: number, page: number) {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString());

    return this.http.get<User[]>(`${this.host}/created_by/${id}`).pipe(
      map((data: any) => {
        return toCamelCase(data);
      })
    );
  }

  getUsersByRole(role: string, size: number, page: number) {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString());

    return this.http.get<User[]>(`${this.host}/rol/${role}`).pipe(
      map((data: any) => {
        return toCamelCase(data);
      })
    );
  }

  dinamicFilters(page: number, size: number, params: any): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString());

    for (const key in params) {
      if (
        params.hasOwnProperty(key) &&
        params[key] !== undefined &&
        params[key] !== ''
      ) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    }

    return this.http
      .get<PaginatedResponse<User>>(`${this.host}/filters`, {
        params: httpParams,
      })
      .pipe(
        map((data: any) => {
          return toCamelCase(data);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

}
