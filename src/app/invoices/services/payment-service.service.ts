import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaymentDto } from '../models/PaymentDto';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentServiceService {
  // Base URL para el servicio de tickets
  private readonly baseUrl = 'http://localhost:8090/payments';

  constructor(private http: HttpClient) {}

  getPaymentByTicketId(ticketId: Number) {
    const url = `${this.baseUrl}/ticket/${ticketId}`;
    return this.http.get<PaymentDto>(url);
  }
}
