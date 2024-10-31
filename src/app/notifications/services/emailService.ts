import { EmailDataContact, EmailDataContactApi } from '../models/notifications/emailDataContact';
import { EmailData } from '../models/notifications/emailData';
import { EmailDataApi } from '../models/notifications/emailData';
import { environment } from '../environments/environment';
import { inject, Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  private readonly http = inject(HttpClient);


  private apiUrl = environment.apis.notifications.url;


  sendEmail(data: EmailData) {
    const emailDataApi = this.transformEmailDataApi(data)
    const url = `${this.apiUrl}/emails/send`
    return this.http.post<EmailDataApi>(url, emailDataApi)
  }

  sendEmailWithContacts(data: EmailDataContact) {
    const emailDataContactApi = this.transformEmailDataContactApi(data)
    const url = `${this.apiUrl}/emails/send-to-contacts`
    return this.http.post<EmailDataContactApi>(url, emailDataContactApi)
  }

  private transformEmailDataApi(data: EmailData): EmailDataApi {
    return {
      recipient: data.recipient,
      subject: data.subject,
      variables: data.variables,
      template_id: data.templateId
    }
  }
  private transformEmailDataContactApi(data: EmailDataContact): EmailDataContactApi {
    return {
      subject: data.subject,
      variables: data.variables,
      template_id: data.templateId,
      contact_ids: data.contactIds
    }
  }


}
