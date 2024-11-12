import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Account, AccountingConcept } from '../models/account';
import { map, Observable } from 'rxjs';
import { PaginatedResponse } from '../models/api-response';
import { AccountingConceptMapperPipe } from '../pipes/accounting-concept-mapper.pipe';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);

  host: string = environment.production 
  ? `${environment.apis.accounts}accounting-concepts/` 
  : 'http://localhost:8002/accounting-concepts/';

  getConceptsByPlotId(
    plotId: number,
    page: number,
    pageSizeize: number
  ): Observable<PaginatedResponse<AccountingConcept>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSizeize.toString());

    return (
      this,
      this.http
        .get<PaginatedResponse<AccountingConcept>>(this.host + plotId, {
          params,
        })
        .pipe(
          map((response: PaginatedResponse<any>) => {
            const transformPipe = new AccountingConceptMapperPipe();
            const transformedConcepts = response.content.map((concept: any) =>
              transformPipe.transform(concept)
            );
            return {
              ...response,
              content: transformedConcepts,
            };
          })
        )
    );
  }

  exportTableToPdf(table: HTMLTableElement, pdfFileName: string): void {
    html2canvas(table).then((canvas: any) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Ajuste para los márgenes
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // const imgWidth = 190;
      // const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      if (imgHeight < pdfHeight) {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        // Si es más grande, dividir en varias páginas
        let position = 10;
        while (position < imgHeight) {
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          position -= pdfHeight;
          if (position < imgHeight - pdfHeight) pdf.addPage();
        }
      }
      pdf.save(`${pdfFileName}.pdf`);
    });
  }

  exportTableToExcel(table: HTMLTableElement, excelFileName: string): void {
    const clonedTable = table.cloneNode(true) as HTMLTableElement;

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `${excelFileName}.xlsx`);
  }

  getAccountsBalances(
    page: number,
    size: number,
    isActive?: boolean,
    sortProperty: string = 'isActive,createdDate',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Observable<Account[]> {
    let params = new HttpParams()
      .set('page', page >= 0 ? page.toString() : '0')
      .set('size', size.toString())
      .set('sort', sortProperty)
      .set('sort_direction', sortDirection);
  
    if (isActive !== undefined) {
      params = params.append('isActive', isActive.toString());
    }
  
    return this.http.get<Account[]>(`http://localhost:8002/accounts`, { params });
  }
  
  
}
