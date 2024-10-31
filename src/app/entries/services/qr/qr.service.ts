import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  private apiUrl = 'http://localhost:8080/qr';

  constructor(private http: HttpClient) {}

  getQr(docNumber: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${docNumber}`, {
      responseType: 'blob',
    });
  }
}
