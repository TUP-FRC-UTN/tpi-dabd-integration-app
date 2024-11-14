import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Auth } from '../models/authorization/authorize.model';
import { VisitorAuthorizationRequest } from '../models/authorization/authorizeRequest.model';
import { CaseTransformerService } from './case-transformer.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8001/auths';

  constructor(
    private http: HttpClient,
    private caseTransformer: CaseTransformerService
  ) {}

  createAuth(
    ownerData: any,
    userId: string
  ): Observable<VisitorAuthorizationRequest> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });

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
    ownerData: any,
    userId: string
  ): Observable<VisitorAuthorizationRequest> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
    });

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
      size: 1000000,
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

  delete(authId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString(),
      'auth-id': authId.toString(),
    });

    return this.http
      .delete<any>(`${this.apiUrl}/authorization`, { headers })
      .pipe(map((response) => response));
  }

  enable(authId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString(),
      'auth-id': authId.toString(),
    });

    return this.http
      .put<any>(`${this.apiUrl}/authorization/activate`, null, { headers })
      .pipe(map((response) => this.caseTransformer.toCamelCase(response)));
  }
}
