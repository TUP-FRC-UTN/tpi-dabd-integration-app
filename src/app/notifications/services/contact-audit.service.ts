import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactAudit, ContactAuditResponse } from '../models/contacts/contactAudit';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

import { ContactType } from '../models/contacts/contactAudit';


@Injectable({
  providedIn: 'root'
})
export class ContactAuditService {

  private apiUrl: string;

  constructor() {

    this.apiUrl = environment.apis.contacts.url;

  }


  private mapContactType(contactType: ContactType): string {
    switch (contactType) {
      case ContactType.EMAIL:
        return 'Correo electrónico';
      case ContactType.PHONE:
        return 'Teléfono';
      case ContactType.SOCIAL_MEDIA_LINK:
        return 'Red social';
      default:
        throw new Error(`Unknown contact type: ${contactType}`);
    }
  }

  public inverseMapContactType(readableContactType: string):string {
    switch(readableContactType){
      case 'Correo electrónico':
        return 'EMAIL';
      case 'Teléfono':
        return 'PHONE';
      case 'Red social':
        return 'SOCIAL_MEDIA_LINK';
      default:
        throw new Error(`Unknown readable contact type: ${readableContactType}`);

    }
  }


  private transformResponseToContactAudit = (response: ContactAuditResponse): ContactAudit => {
    return {
      auditId: response.audit_id,
      contactId: response.contact_id,
      value: response.value,
      contactType: this.mapContactType(response.contact_type),
      revisionId: response.revision_id,
      revisionType: response.revision_type,
      revisionDate: response.revision_date
    };
  }







  http : HttpClient = inject(HttpClient)




  /**
   * Método para obtener todo el historial de auditoría
   */

  getContactAudits(): Observable<ContactAudit[]> {


     const url = `${this.apiUrl}/audit/contacts`
    return this.http.get<ContactAuditResponse[]>(url)
    .pipe(
      map(
        responses => responses.map(this.transformResponseToContactAudit)
      )
    );
  }



}
