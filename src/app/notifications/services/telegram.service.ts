import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private baseApiUrl = 'http://localhost:8011/messages/telegram';

  constructor(private http: HttpClient) {}

  sendMessage(type: 'texto' | 'audio' | 'video' | 'imagen', formData: FormData): Observable<any> {
    const endpoint = type === 'audio' 
      ? `${this.baseApiUrl}/audio`
      : this.baseApiUrl;

    return this.http.post(endpoint, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
