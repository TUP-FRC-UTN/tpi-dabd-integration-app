import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { VisitorAuthorizationRequest } from '../../models/authorization/authorizeRequest.model';
import { Auth } from '../../models/authorization/authorize.model';
import { AccessModel } from '../../models/accesses/access.model';
import { CaseTransformerService } from '../../services/case-transformer.service';
import { environment } from '../../../../environments/environment.prod';
import { SessionService } from '../../../users/services/session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
 
  private apiUrl: string = environment.production
  ? `${environment.apis.accesses+`auths`}`
  : 'http://localhost:8001/';
  
  sessionService = inject(SessionService);


  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  createAuth(
    ownerData: any
  ): Observable<VisitorAuthorizationRequest> {

    const user = this.sessionService.getItem('user');
    const headers = new HttpHeaders({
      'x-user-id': user.id.toString(),
    })
    
    const snakeCaseData = this.caseTransformer.toSnakeCase(ownerData);

    return this.http
      .post<VisitorAuthorizationRequest>(
        this.apiUrl + '/authorization',
        snakeCaseData,
        { headers }
      )
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  updateAuth(
    ownerData: any
  ): Observable<VisitorAuthorizationRequest> {

    const user = this.sessionService.getItem('user');
    const headers = new HttpHeaders({
      'x-user-id': user.id.toString(),
    })
    const snakeCaseData = this.caseTransformer.toSnakeCase(ownerData);

    return this.http
      .put<VisitorAuthorizationRequest>(
        this.apiUrl + '/authorization',
        snakeCaseData,
        { headers }
      )
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }

  getAll(page: number, size: number, isActive?: boolean): Observable<Auth[]> {
    const params = this.caseTransformer.toSnakeCase({
      size: 100000,
      isActive,
    });

    return this.http
      .get<Auth[]>(this.apiUrl, {
        params: params as any,
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
  }

  getValid(document: number): Observable<Auth[]> {
    return this.http
      .get<Auth[]>(`${this.apiUrl}/authorization/${document}`)

  }

  getValidAuths(document: number): Observable<Auth[]> {
    const params = { docNumber: document };

    return this.http
      .get<Auth[]>(`${this.apiUrl}/valid`, {
        params: params as any,
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
  }

  getByDocument(document: number): Observable<Auth[]> {
    const params = this.caseTransformer.toSnakeCase({ docNumber: document });

    return this.http
      .get<Auth[]>(this.apiUrl, {
        params: params as any,
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
  }

  getById(document: number): Observable<Auth[]> {
    const params = this.caseTransformer.toSnakeCase({ id: document });

    return this.http
      .get<Auth[]>(this.apiUrl, {
        params: params as any,
      })
      .pipe(
        map((response) =>
          response.map((item) => this.caseTransformer.toCamelCase(item))
        )
      );
  }

  delete(authId: number): Observable<any> {
    let headers = new HttpHeaders({
      'auth-id': authId.toString(),
    });
  
    const user = this.sessionService.getItem('user');
    console.log('service' + user);
  
    if (user) {
      console.log('service =' + user.id);
      headers = headers.set('x-user-id', user.id.toString());
    } else {
      console.log('no user');
    }
  
    return this.http
      .delete<any>(`${this.apiUrl}/authorization`, { headers })
      .pipe(map((response) => response));
  }
  

  enable(authId: number): Observable<any> {
    let headers = new HttpHeaders({
      'auth-id': authId.toString(),
    });

    const user = this.sessionService.getItem('user');
      console.log('service' + user);
    if (user) {
      console.log('service =' + user.id);
      headers = headers.set('x-user-id', user.id.toString());
    } else {
      console.log('no user');
    }
  

    return this.http
      .put<any>(`${this.apiUrl}/authorization/activate`, null, { headers })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }
}
