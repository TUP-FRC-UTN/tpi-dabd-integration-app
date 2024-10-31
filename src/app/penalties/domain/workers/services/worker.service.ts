import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { WorkerRequestDto, WorkerResponseDTO } from '../models/worker.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private apiUrl = environment.constructionApiUrl;

  private readonly http = inject(HttpClient);

  // BehaviorSubject para manejar el estado de mensajes
  private messageSubject = new BehaviorSubject<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  public message$: Observable<{
    type: 'success' | 'error';
    message: string;
  } | null> = this.messageSubject.asObservable();

  registerWorker(worker: WorkerRequestDto): Observable<WorkerResponseDTO> {
    return this.http
      .post<WorkerResponseDTO>(`${this.apiUrl}/workers`, worker)
      .pipe(
        map((response) => {
          this.messageSubject.next({
            type: 'success',
            message: `Se creó el trabajador ${response.id}`,
          });
          return response;
        }),
        catchError((error) => {
          this.messageSubject.next({
            type: 'error',
            message: 'Error en alta de trabajador',
          });
          return throwError(() => new Error('Error en alta de worker'));
        })
      );
  }

  unAssignWorker(id: number): Observable<string> {
    return this.http
      .put<string>(`${this.apiUrl}/workers/${id}/unassign`, undefined)
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          console.error('Error en la desasignación:', error);
          return throwError(
            () => new Error('Error en la desasignación del trabajador')
          );
        })
      );
  }
}
