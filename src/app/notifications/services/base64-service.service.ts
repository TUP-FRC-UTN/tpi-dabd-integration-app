import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Base64Service {

  encodeToBase64(text: string): string {
    return btoa(encodeURIComponent(text));
  }

  decodeFromBase64(encoded: string): string {
    return decodeURIComponent(atob(encoded));
  }
}