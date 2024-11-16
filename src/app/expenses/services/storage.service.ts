import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  saveToStorage(object: any, item : string): void {
    const jsonObject = JSON.stringify(object);
    sessionStorage.setItem(item , jsonObject);
    localStorage.setItem(item, jsonObject);
  }

  // Recupera el objeto desde sessionStorage
  getFromSessionStorage( item : string): any | null {
    const jsonObject = sessionStorage.getItem(item);
    return jsonObject ? JSON.parse(jsonObject) : null;
  }

  // Recupera el objeto desde localStorage
  getFromLocalStorage(item : string): any | null {
    const jsonObject = localStorage.getItem(item);
    return jsonObject ? JSON.parse(jsonObject) : null;
  }
}
