import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class IaService {
    private apiUrl: string;

    constructor() {
  
      this.apiUrl = environment.apis.notifications.url;
    }

    private http: HttpClient = inject(HttpClient)

    askTemplateToAI(request: string): Observable<string> {
      const url = `${this.apiUrl}/openAI/template`;
      return this.http.post<string>(url, request, { responseType: 'text' as 'json' }); 
    }

    analyzdeDashboard(request: string): Observable<string> {
      const url = `${this.apiUrl}/openAI/dashboard`;
      return this.http.post<string>(url, request, { responseType: 'text' as 'json' }); 
    }
   
  }