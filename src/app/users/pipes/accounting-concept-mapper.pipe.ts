import { Pipe, PipeTransform } from '@angular/core';
import { AccountingConcept } from '../models/account';

@Pipe({
  name: 'accountingConceptMapper',
  standalone: true
})
export class AccountingConceptMapperPipe implements PipeTransform {

  transform(accountingConcept: any): AccountingConcept {
    return {
      plotId: accountingConcept.plot_id.toString(),
      accountingDate: accountingConcept.accounting_date,
      concept: accountingConcept.concept,
      comments: accountingConcept.comments,
      amount: accountingConcept.amount,
      documentId: accountingConcept.document_id.toString()
    };
  }

}
