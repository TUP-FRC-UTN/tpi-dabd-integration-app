import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl: string = environment.production
    ? `${environment.apis.cadastre}files`
    : 'http://localhost:8004/files';
  private sessionService = inject(SessionService);

  constructor(private http: HttpClient) {}

  getFileById(fileId: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `/${fileId}`).pipe(
      map((response: any) => {
        return response;
      })
    );
  }


  updateFileStatus(fileId: number, status: any, note: any): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString(),
    });

    const change = {
      approval_status: status,
      review_note: note,
    };

    return this.http.patch<any>(this.apiUrl + `/${fileId}`, change, {
      headers,
    });
  }
}
