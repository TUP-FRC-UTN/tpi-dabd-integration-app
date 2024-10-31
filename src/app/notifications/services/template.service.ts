import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { TemplateModel } from '../models/templates/templateModel';

interface NewTemplate {
  name: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private readonly http = inject(HttpClient);
  private apiUrl = environment.apis.notifications.url;

  getAllTemplates(): Observable<TemplateModel[]> {
    return this.http.get<any[]>(`${this.apiUrl}/email-templates`).pipe(
      map(x => x.map(y => this.transformToTemplate(y)))
    );
  }

  sendTemplate(template: NewTemplate): Observable<TemplateModel> {
    const base64Body = btoa(unescape(encodeURIComponent(template.body)));
    
    const requestData = {
      name: template.name,
      base64body: base64Body
    };

    return this.http.post<any>(`${this.apiUrl}/email-templates`, requestData).pipe(
      map(response => this.transformToTemplate(response))
    );
  }

  updateTemplate(template: TemplateModel): Observable<TemplateModel> {
    const apiTemplate = this.transformToApiTemplate(template);
    return this.http.put<any>(`${this.apiUrl}/email-templates/${template.id}`, apiTemplate).pipe(
      map(response => this.transformToTemplate(response))
    );
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/email-templates/${id}`);
  }

  private transformToTemplate(data: any): TemplateModel {
    return {
      id: data.id,
      name: data.name,
      body: data.body,
      active: data.active,  
    };
  }


  private transformToApiTemplate(template: TemplateModel): any {
    return {
      name: template.name,
      body: template.body,
    };
  }
}

