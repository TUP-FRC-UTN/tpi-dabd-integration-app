import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private roleSubject = new BehaviorSubject<string>('USER');
  private lotesSubject = new BehaviorSubject<number[]>([]);
  private userIdSubject = new BehaviorSubject<number>(0);
 
  currentRole$ = this.roleSubject.asObservable();
  currentLotes$ = this.lotesSubject.asObservable();
  currentUserId$ = this.userIdSubject.asObservable();

  changeRole(newRole: string) {
    this.roleSubject.next(newRole);
  }

  changeLotes(newLotes: number[]) {
    this.lotesSubject.next(newLotes);
  }

  changeUserId(newUserId: number) {
    this.userIdSubject.next(newUserId);
  }
}
