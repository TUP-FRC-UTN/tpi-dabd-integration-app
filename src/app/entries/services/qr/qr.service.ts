import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { SessionService } from '../../../users/services/session.service';



export interface sendQRByEmailRequest {
  email: string;
  invitor_name: string;
  doc_number: number;
}

@Injectable({
  providedIn: 'root',
})
export class QrService {



  private urlEnviroment = environment.apis.accesses;//8080
  sesionService = inject(SessionService)

  constructor(private http: HttpClient) {}

  getQr(docNumber: number): Observable<Blob> {
    return this.http.get(`${this.urlEnviroment}qr/${docNumber}`, {
      responseType: 'blob',
    });
  }

  sendQRByEmail(request: sendQRByEmailRequest , userId: number): Observable<any> {

    let headers = new HttpHeaders();
    const user = this.sesionService.getItem('user');

    if(!user) {
      console.error('Error: user es nulo o undefined');
    }else{
      headers = headers.set('x-user-id', user.id.toString());
    }
    
    return this.http.post(`${this.urlEnviroment}qr/send` , request ,{ headers });
  }
}
