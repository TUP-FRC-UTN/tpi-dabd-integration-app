import { Component, inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { PaymentExcelService } from '../services/payment-excel.service';
import { TicketService } from '../services/ticket.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-ticket-payment-filter-buttons',
  standalone: true,
  imports: [],
  templateUrl: './ticket-payment-filter-buttons.component.html',
  styleUrl: './ticket-payment-filter-buttons.component.css',
})
export class TicketPaymentFilterButtonsComponent<
  T extends Record<string, any>
> {
  LIMIT_32BITS_MAX = 2147483647;
  private excelService = inject(PaymentExcelService);

  private ticketService = inject(TicketService);
  // Input to receive the HTML table from the parent
  @Input() tableName!: HTMLTableElement;
  // Input to receive a generic list from the parent component
  @Input() itemsList!: T[];
  // Input to redirect to the form.
  @Input() formPath: string = '';
  // Represent the name of the object for the exports.
  // Se va a usar para los nombres de los archivos.
  @Input() objectName: string = '';
  // Represent the dictionaries of ur object.
  // Se va a usar para las traducciones de enum del back.
  @Input() dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<T[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  ngOnInit(): void {}

  getActualDayFormat() {
    const today = new Date();

    const formattedDate = today.toISOString().split('T')[0];

    return formattedDate;
  }
  /**
   * Export the HTML table to a PDF file.
   * Calls the `exportTableToPdf` method from the `CadastreExcelService`.
   */
  exportToPdf() {

    const doc = new jsPDF();
   
    // Título del PDF
    doc.setFontSize(18);
    doc.text('Tickets Report', 14, 20);

    this.ticketService.getAllTickets().subscribe(
      (response) => {
        autoTable(doc, {
          startY: 30,
          head: [['Periodo', 'Vencimiento', 'Total', 'Estado']],
          body: response.map(expense => [
            expense.ownerId.first_name,
            expense.issueDate instanceof Date ? expense.issueDate.toLocaleDateString() : expense.issueDate, // convertir fecha a string
            expense.id,
            expense.status
          ]),
        });
      },
      (error) => {
        console.log('Error retrieved all, on export component.');
      }
    );
    

       // Guardar el PDF después de agregar la tabla
       doc.save('expenses_report.pdf');
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  //#region TIENEN QUE MODIFICAR EL SERIVCIO CON SU GETALL
  exportToExcel() {
    this.ticketService.getAllTicketsPage(0, this.LIMIT_32BITS_MAX).subscribe(
      (response) => {
        this.excelService.exportListToExcel(
          response.content,
          `${this.getActualDayFormat()}_${this.objectName}`
        );
      },
      (error) => {
        console.log('Error retrieved all, on export component.');
      }
    );
  }

  /**
   * Filters the list of items based on the input value in the text box.
   * The filter checks if any property of the item contains the search string (case-insensitive).
   * The filtered list is then emitted through the `filterSubject`.
   *
   * @param event - The input event from the text box.
   */
  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.value?.length <= 2) {
      this.filterSubject.next(this.itemsList);
    } else {
      const filterValue = target.value.toLowerCase();

      const filteredList = this.itemsList.filter((item) => {
        return Object.values(item).some((prop) => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          const translations =
            this.dictionaries && this.dictionaries.length
              ? this.dictionaries
                  .map((dict) => this.translateDictionary(propString, dict))
                  .filter(Boolean)
              : [];

          return (
            propString.includes(filterValue) ||
            translations.some((trans) =>
              trans?.toLowerCase().includes(filterValue)
            )
          );
        });
      });

      this.filterSubject.next(filteredList.length > 0 ? filteredList : []);
    }
  }

  /**
   * Translates a value using the provided dictionary.
   *
   * @param value - The value to translate.
   * @param dictionary - The dictionary used for translation.
   * @returns The key that matches the value in the dictionary, or undefined if no match is found.
   */
  translateDictionary(value: any, dictionary?: { [key: string]: any }) {
    if (value !== undefined && value !== null && dictionary) {
      for (const key in dictionary) {
        if (dictionary[key].toString().toLowerCase() === value.toLowerCase()) {
          return key;
        }
      }
    }
    return;
  }
}
