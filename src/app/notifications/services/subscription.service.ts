import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Subscription } from '../models/suscriptions/subscription';
import { ContactModel } from '../models/contacts/contactModel';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface ApiSubscriptionUpdate {
  contactId: number;
  subscriptionId: number;
  subscriptionValue: boolean;
}

interface ApiContactResponse {
  id: number;
  subscriptions: string[];
  contact_value: string;
  contact_type: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {




  private http: HttpClient = inject(HttpClient)

  private apiUrl: string = environment.apis.contacts.url;

  getAllSubscriptions(): Observable<Subscription[]> {

    const url = `${environment.apis.contacts.url}/subscriptions`;

    return this.http.get<Subscription[]>(url).pipe(
      map(subscriptions => subscriptions.map(subscription => ({
        ...subscription,
        name: this.getSubscriptionNameInSpanish(subscription.name)
      })))
    );
  }




  updateContactSubscriptions(contact: ContactModel): Observable<ContactModel> {

    return this.getAllSubscriptions().pipe(
      switchMap(availableSubscriptions => {

        const updateObservables = contact.subscriptions.map(subscriptionName => {
          const subscription = availableSubscriptions.find(s => s.name === subscriptionName);

          if (!subscription) {
            throw new Error(`Subscription ${subscriptionName} not found`);
          }


          const updateData: ApiSubscriptionUpdate = {
            contactId: contact.id,
            subscriptionId: subscription.id,
            subscriptionValue: true
          };


          return this.http.put<any>(`${this.apiUrl}/subscriptions`, updateData);
        });


        return forkJoin(updateObservables).pipe(
          map(() => contact)
        );
      })
    );
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









