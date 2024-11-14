import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  host: string = `${environment.production ? `${environment.apis.cadastre}` : `${environment.apis.cadastre}`}files`;
  private sessionService = inject(SessionService);
  constructor(private http: HttpClient) {}

  getFileById(fileId: number): Observable<any> {
    return this.http.get<any>(this.host + `/${fileId}`).pipe(
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

    return this.http.patch<any>(this.host + `/${fileId}`, change, {
      headers,
    });
  }
}
