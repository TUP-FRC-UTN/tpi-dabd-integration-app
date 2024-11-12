import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserTypeService {
  private userType: UserType  = UserType.ADMIN
  private userSubject = new Subject<string>();
  userType$: Observable<string> =  this.userSubject.asObservable();


  isAdmin(): boolean {
    return this.userType === UserType.ADMIN;
  }

  isOwner(): boolean {
    return this.userType === UserType.OWNER;
  }

  isGuard(): boolean {
    return this.userType === UserType.GUARD;
  }


  setType(type :UserType){
    this.userType = type
    this.userSubject.next(type);
  }

  getType():UserType{
    return this.userType
  }

}

export enum UserType{
  "ADMIN"= "ADMIN",
  "OWNER" = "OWNER",
  "GUARD" = "GUARD"
}

