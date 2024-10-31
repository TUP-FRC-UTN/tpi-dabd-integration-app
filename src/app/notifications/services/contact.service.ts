import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ContactModel } from '../models/contacts/contactModel';
import { environment } from '../environments/environment';
import { Observable, map } from 'rxjs';
import { SubscriptionMod } from '../models/suscriptions/subscription';
import { ContactType } from '../models/contacts/contactAudit';

@Injectable({
  providedIn: 'root'
})


export class ContactService {

  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private apiUrl: string;

  constructor() {

    this.apiUrl = environment.apis.contacts.url;

  }

  getAllContacts(): Observable<ContactModel[]> {
    return this.http.get<ContactModel[]>(`${this.apiUrl}/contacts`).pipe(
      map(contacts => contacts.map(contact => ({
        ...this.transformToContact(contact),
        subscriptions: contact.subscriptions.map(subscription =>
          this.getSubscriptionNameInSpanish(subscription)
        )
      })))
    );
  }
  getFilteredContactsFromBackend(active: boolean  | undefined, searchText: string = '', contactType?: string): Observable<ContactModel[]> {

    let url = `${this.apiUrl}/contacts?active=${active}`;

    active != undefined ? url : url = `${this.apiUrl}/contacts`;

    if (searchText) {
      url += `&search=${encodeURIComponent(searchText)}`;
    }
    if (contactType !== undefined && contactType !== '') {
      url += `&contactType=${contactType}`;
    }

    return this.http.get<ContactModel[]>(url).pipe(
      map(contacts => contacts.map(contact => ({
        ...this.transformToContact(contact),
        subscriptions: contact.subscriptions.map(subscription =>
          this.getSubscriptionNameInSpanish(subscription)
        )
      })))
    );
  }

  getAllContactsWithClientSideFilters(searchText: string = '', isActive?: boolean): Observable<ContactModel[]> {
    return this.getAllContacts().pipe(
      map(contacts => {

        let filteredContacts = contacts;
        if (searchText) {
          filteredContacts = filteredContacts.filter(contact =>
            contact.contactValue.toLowerCase().includes(searchText.toLowerCase()) ||
            contact.contactType.toLowerCase().includes(searchText.toLowerCase())
          );
        }

        if (isActive !== undefined) {
          filteredContacts = filteredContacts.filter(contact => contact.active === isActive);
        }
        return filteredContacts;
      })
    );
  }

  getContactById(id: number): Observable<ContactModel> {
    return this.http.get<any>(`${this.apiUrl}/contacts/${id}`).pipe(
      map(contact => this.transformToContact(contact))
    );
  }

  saveContact(contact: ContactModel): Observable<ContactModel[]> {
    const apiContact = this.transformToApiContactToPost(contact);
    return this.http.post<any[]>(`${this.apiUrl}/contacts`, apiContact).pipe(
      map(contacts => contacts.map(contact => this.transformToContact(contact)))
    );
  }
  modifacateSubscription(data: SubscriptionMod) {
    const url = `${this.apiUrl}/contacts/subscription`
    return this.http.put<SubscriptionMod>(url, data)
  }

  updateContact(contact: ContactModel): Observable<ContactModel> {
    const apiContact = this.transformToApiContactToUpdate(contact);
    return this.http.put<any>(`${this.apiUrl}/contacts`, apiContact).pipe(
      map(response => this.transformToContact(response))
    );
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contacts/${id}`);
  }

  private transformToContact(data: any): ContactModel {
    return {
      id: data.id,
      subscriptions: data.subscriptions || [],
      contactValue: data.contact_value,
      contactType: this.mapContactType(data.contact_type),
      active: data.active,
      showSubscriptions: false
    };
  };

  private transformToApiContactToPost(contact: ContactModel): any {
    return [{
      contact_value: contact.contactValue,
      contact_type: contact.contactType,
    }];
  }

  private transformToApiContactToUpdate(contact: ContactModel): any {
    return {
      id: contact.id,
      value: contact.contactValue,
    };
  }

  private mapContactType(contactType: ContactType): string {
    switch (contactType) {
      case ContactType.EMAIL:
        return 'Correo eléctronico';
      case ContactType.PHONE:
        return 'Teléfono';
      case ContactType.SOCIAL_MEDIA_LINK:
        return 'Red social';
      default:
        throw new Error(`Unknown contact type: ${contactType}`);
    }
  }

  getSubscriptionNameInSpanish(englishName: string): string {
    const translations: { [key: string]: string } = {
      'GENERAL': 'General',
      'MODERATION': 'Moderación',
      'CONSTRUCTION': 'Construcción',
      'EMPLOYEE_PAYMENT': 'Pago de Empleados',
      'EXPENSES_EXPIRATION': 'Vencimiento de Gastos',
      'DEBT': 'Deuda',
      'GENERAL_BILL': 'Factura General',
      'PAYMENT': 'Pago',
      'USER': 'Usuario',
      'ASSOCIATED_USER_CREATED': 'Usuario Asociado Creado',
      'WORKER_LATE_DEPARTURE': 'Salida Tardía de Trabajador',
      'INVENTORY': 'Inventario',
      'GENERAL_EXPENSE': 'Gasto General'
    };

    return translations[englishName] || englishName;
  }

}

