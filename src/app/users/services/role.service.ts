import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Role } from '../models/role';
import { PaginatedResponse } from '../models/api-response';
import { TransformRolePipe } from '../pipes/role-mapper.pipe';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  host: string = "http://localhost:8283/roles"

  constructor(private http: HttpClient) { }

  getRole(id: number): Observable<Role>{
    return this.http.get<any>(`${this.host}/${id}`).pipe(
      map((role: any) => { 
        return new TransformRolePipe().transform(role); 
      })
    );
  }

  getAllRoles(page : number, size : number, isActive? : boolean): Observable<PaginatedResponse<Role>>{
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  
    if (isActive !== undefined) {
      params = params.append('isActive', isActive);
    }

    return this.http.get<PaginatedResponse<Role>>(this.host, {params}).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformedRoles = response.content.map((role: any) => new TransformRolePipe().transform(role));
        return {
          ...response,
          content: transformedRoles 
        };
      })
    );
  }

  createRole(role: Role, userId: number): Observable<Role>{
    const headers = new HttpHeaders({
      'x-user-id': userId
    });
    
    return this.http.post<Role>(this.host, role, {headers});
  }

  updateRole(id: number, role: Role, userId: number): Observable<Role>{
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.put<Role>(`${this.host}/${id}`, role, {headers});
  }

  deleteRole(id: number, userId: number): Observable<void> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });
    return this.http.delete<void>(`${this.host}/${id}`, {headers});
  }

  reactiveRole(id: number, userId: number): Observable<void> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });
    return this.http.patch<void>(`${this.host}/${id}`, {}, {headers});
  }
}