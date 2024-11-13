import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  InfractionResponseDTO,
  InfractionModel,
  InfractionDto,
  InfractionStatusEnum,
} from '../models/infraction.model';
import { BehaviorSubject, finalize, map, Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InfractionServiceService {
  private apiUrl = environment.apis.moderations;

  private itemsSubject = new BehaviorSubject<InfractionResponseDTO[]>([]);
  items$ = this.itemsSubject.asObservable();

  private totalItemsSubject = new BehaviorSubject<number>(0);
  totalItems$ = this.totalItemsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private oneInfraction = new BehaviorSubject<
    InfractionResponseDTO | undefined
  >(undefined);
  oneInfraction$ = this.oneInfraction.asObservable();

  private readonly http = inject(HttpClient);

  setItems(items: InfractionResponseDTO[]): void {
    this.itemsSubject.next(items);
  }

  setTotalItems(total: number): void {
    this.totalItemsSubject.next(total);
  }

  getAllInfractions(
    page: number,
    limit: number,
    searchParams: any = {}
  ): Observable<{ items: InfractionResponseDTO[]; total: number }> {
    this.isLoadingSubject.next(true); // Iniciar loading
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', limit.toString());

    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key]) {
        params = params.set(key, searchParams[key]);
      }
    });

    return this.http
      .get<any>(`${this.apiUrl}/infractions/pageable`, { params })
      .pipe(
        map((data) => {
          const items = data.content || [];
          const total = data.totalElements || 0;
          return { items, total };
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getAllItems(page: number, limit: number) {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', limit.toString());

    return this.http
      .get<any>(`${this.apiUrl}/infractions/pageable`, { params })
      .pipe(
        map((data) => {
          return data.content;
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getInfractionById(id: number): Observable<InfractionResponseDTO | undefined> {
    return this.http.get<any>(`${this.apiUrl}/infractions/${id}`).pipe(
      map((oneInfraction) => {
        this.oneInfraction.next(oneInfraction);
        return oneInfraction;
      })
    );
  }

  createInfraction(infraction: InfractionDto): Observable<InfractionModel> {
    return this.http.post<InfractionModel>(
      `${this.apiUrl}/infractions`,
      infraction,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  changeInfractionStatus(
    infractionData: FormData,
    infractionId: number
  ): Observable<InfractionResponseDTO> {
    return this.http.put<InfractionResponseDTO>(
      `${this.apiUrl}/infractions/${infractionId}/status`,
      {
        user_id: infractionData.get('user_id'),
        status: infractionData.get('status'),
        description: infractionData.get('description'),
      }
    );
  }

  downloadDocumentation(documentationId: number, filename: string): void {
    const url = `${this.apiUrl}/proof/documentation/${documentationId}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (response: Blob) => {
        this.downloadFile(response, filename);
      },
      error: (error) => {
        console.error('Download failed', error);
      },
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  appealInfraction(
    infractionData: FormData,
    infractionId: number
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/infractions/${infractionId}/appeal`,
      infractionData
    );
  }
}
