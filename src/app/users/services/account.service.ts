import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Account, AccountingConcept } from '../models/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient)

  host: string = "http://localhost:8002/"

  //page : number, size : number, isActive? : boolean
  getAllPlots() {
    // let params = new HttpParams()
    // .set('page', page.toString())
    // .set('size', size.toString());

    // if (isActive !== undefined) {
    //   params = params.append('isActive', isActive.toString());
    // }

    // return this.http.get<PaginatedResponse<Plot>>(this.host, { params }).pipe(
    //   map((response: PaginatedResponse<any>) => {
    //     const transformPipe = new TransformPlotPipe();
    //     const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
    //     return {
    //       ...response,
    //       content: transformedPlots
    //     };
    //   })
    // );\
    const accounts: Account[] = [
      { id: 1, plotId: 1, balance: -250.75 },
      { id: 2, plotId: 2, balance: 1000.50 },
      { id: 3, plotId: 3, balance: -150.00 },
      { id: 4, plotId: 104, balance: 450.20 },
      { id: 5, plotId: 105, balance: 0.00 },
      { id: 6, plotId: 106, balance: 750.10 },
      { id: 7, plotId: 107, balance: -320.40 },
      { id: 8, plotId: 108, balance: 999.99 },
      { id: 9, plotId: 109, balance: 185.75 },
      { id: 10, plotId: 110, balance: 600.00 },
  ];

    return accounts;
  }

  getConceptByAccountId(accoundId : number) {
    const accountingConcepts: AccountingConcept[] = [
      {
        id: 1,
        accountingDate: new Date('2024-01-15'),
        concept: 'PAYMENT',
        comments: 'Payment for services rendered.',
        amount: -1500.00
      },
      {
        id: 2,
        accountingDate: new Date('2024-02-10'),
        concept: 'COMMON_EXPENSE',
        comments: 'Monthly office supplies purchase.',
        amount: 250.75
      },
      {
        id: 3,
        accountingDate: new Date('2024-03-05'),
        concept: 'EXTRAORDINARY_EXPENSE',
        comments: 'Repair of office equipment.',
        amount: 800.50
      },
      {
        id: 4,
        accountingDate: new Date('2024-04-20'),
        concept: 'PAYMENT',
        comments: 'Payment received from client.',
        amount: -2000.00
      },
      {
        id: 5,
        accountingDate: new Date('2024-05-11'),
        concept: 'COMMON_EXPENSE',
        comments: 'Utilities bill for April.',
        amount: 300.25
      },
      {
        id: 6,
        accountingDate: new Date('2024-06-30'),
        concept: 'EXTRAORDINARY_EXPENSE',
        comments: 'New software license purchase.',
        amount: 1200.00
      }
    ];

    return accountingConcepts;
  }
}
