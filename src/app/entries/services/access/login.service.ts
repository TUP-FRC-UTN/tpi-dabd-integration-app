import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {LoginModel} from "../../models/login.model";

@Injectable({
  providedIn: 'root'
})
export class LoginService {


  constructor() { }

  getLogin():LoginModel{
    return {
      birthDate: "", docNumber: 0, docType: "", id: 2, lastName: "R.", name: "Juan"
    }
  }
}
