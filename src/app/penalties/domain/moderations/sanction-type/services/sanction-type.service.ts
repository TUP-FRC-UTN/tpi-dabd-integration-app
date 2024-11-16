import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ChargeTypeEnum,
  SanctionType,
  SanctionTypeRequestDTO,
} from '../models/sanction-type.model';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  throwError,
} from 'rxjs';
import { environment } from '../../../../../../environments/environment';

type OneSanctionType = SanctionType | undefined;
@Injectable({
  providedIn: 'root',
})
export class SanctionTypeService {
  private http = inject(HttpClient);

  private apiUrl = environment.apis.moderations.slice(0, -1);

  private oneSanctionType = new BehaviorSubject<OneSanctionType>(undefined);
  oneSanctionType$ = this.oneSanctionType.asObservable();

  private itemsSubject = new BehaviorSubject<SanctionType[]>([]);
  items$ = this.itemsSubject.asObservable();

  private totalItemsSubject = new BehaviorSubject<number>(0);
  totalItems$ = this.totalItemsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  ChargeTypeEnum = ChargeTypeEnum;

  getSanctionTypes(name: string ='') {
    let params = new HttpParams();
    if (name && name !== '') {
      params = params.set('searchValue', name);
    }

    return this.http.get<Array<SanctionType>>(`${this.apiUrl}/sanction-type`, {
      params,
    });
  }

  getPaginatedSanctionTypes(
    page: number,
    limit: number,
    searchParams: any = {}
  ): Observable<{ items: SanctionType[]; total: number }> {
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
      .get<any>(`${this.apiUrl}/sanction-type/pageable`, { params })
      .pipe(
        map((data) => {
          const items = data.content || [];
          const total = data.totalElements || 0;
          return { items, total };
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  setItems(items: SanctionType[]): void {
    this.itemsSubject.next(items);
  }

  setTotalItems(total: number): void {
    this.totalItemsSubject.next(total);
  }
  getChargeTypeKeys(): string[] {
    return Object.keys(this.ChargeTypeEnum) as Array<
      keyof typeof ChargeTypeEnum
    >;
  }

  getSanctionTypeById(id: number): Observable<SanctionType | undefined> {
    return this.http.get<any>(`${this.apiUrl}/sanction-type/${id}`).pipe(
      map((sanctionType) => {
        this.oneSanctionType.next(sanctionType);
        return sanctionType;
      })
    );
  }

  registerSanctionType(
    sanctionType: SanctionTypeRequestDTO
  ): Observable<SanctionType> {
    return this.http
      .post<SanctionType>(`${this.apiUrl}/sanction-type`, sanctionType)
      .pipe(
        map((newItem) => {
          const updatedItems = [...this.itemsSubject.value, newItem];
          this.itemsSubject.next(updatedItems);
          return newItem;
        }),
        catchError((error) => {
          return throwError(() => new Error('Error en alta de tipo'));
        })
      );
  }

  updateSanctionType(sanctionType: SanctionType): Observable<SanctionType> {
    return this.http
      .put<SanctionType>(`${this.apiUrl}/sanction-type/${sanctionType.id}`, {
        description: sanctionType.description,
        amount: sanctionType.amount,
        charge_type: sanctionType.charge_type,
        infraction_days_to_expire: sanctionType.infraction_days_to_expire,
        amount_of_infractions_for_fine:
          sanctionType.amount_of_infractions_for_fine,
      })
      .pipe(
        map((newItem) => {
          return newItem;
        }),
        catchError((error) => {
          return throwError(() => new Error('Error en actualización de multa'));
        })
      );
  }
}
