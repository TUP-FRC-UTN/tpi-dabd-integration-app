import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfractionBadgeService {
  private infractionsCountSubject = new BehaviorSubject<number>(0);
  infractionsCount$ = this.infractionsCountSubject.asObservable();

  updateInfractionsCount(newCount: number): void {
    this.infractionsCountSubject.next(newCount);
  }
}
