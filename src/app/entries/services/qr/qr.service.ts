import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface sendQRByEmailRequest {
  email : string;
  invitor_name: string;
  doc_number:number;
}

@Injectable({
  providedIn: 'root'
})
export class QrService {

  private apiUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/qr';
  private urlEnviroment = environment.apis.accesses;

  constructor(private http: HttpClient) {}

  getQr(docNumber: number): Observable<Blob> {
    return this.http.get(`${this.urlEnviroment}/qr/${docNumber}`, { responseType: 'blob' });
  }

  sendQRByEmail(request: sendQRByEmailRequest , userId: number): Observable<any> {

    const headers = new HttpHeaders({
      'x-user-id': userId
    });
    return this.http.post(`${this.urlEnviroment}/qr/send` , request ,{ headers });
  }
}
