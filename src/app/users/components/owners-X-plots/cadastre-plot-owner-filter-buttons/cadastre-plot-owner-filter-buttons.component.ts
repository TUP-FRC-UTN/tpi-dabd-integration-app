import { Component, inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { Router } from '@angular/router';
import { OwnerPlotService } from '../../../services/owner-plot.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-cadastre-plot-owner-filter-buttons',
  standalone: true,
  imports: [],
  templateUrl: './cadastre-plot-owner-filter-buttons.component.html',
  styleUrl: './cadastre-plot-owner-filter-buttons.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CadastrePlotOwnerFilterButtonsComponent<T extends Record<string, any>> {
  private router = inject(Router);

  // Reemplazen con su servicio para el getAll.

  private ownerPlotService = inject(OwnerPlotService)

  // Inject the Excel service for export functionality
  private excelService = inject(CadastreExcelService);

  LIMIT_32BITS_MAX = 2147483647

  private dataMapper = (item: T) => [
    item["plotNumber"],
    item["blockNumber"],
    item["totalArea"],
    item['builtArea'],
    item["plotStatus"],
    item["plotType"]
  ];

  @Input() ownerId : string = '';
  // Input to receive the HTML table from the parent
  @Input() tableName!: HTMLTableElement;
  // Input to receive a generic list from the parent component
  @Input() itemsList!: T[];
  // Input to redirect to the form.
  @Input() formPath: string = "";
  // Represent the name of the object for the exports.
  // Se va a usar para los nombres de los archivos.
  @Input() objectName : string = ""
  // Represent the dictionaries of ur object.
  // Se va a usar para las traducciones de enum del back.
  @Input() dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<T[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  ngOnInit(): void {}

  // Se va a usar para los nombres de los archivos.
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
    // TODO: Ver como hacer llegar el uno
    this.ownerPlotService.giveAllPlotsByOwner(this.ownerId, 0, this.LIMIT_32BITS_MAX).subscribe(
      response => {
        this.excelService.exportListToPdf(response.content, `${this.getActualDayFormat()}_${this.objectName}`, [], this.dataMapper);
      },
      error => {
        console.log("Error retrieved all, on export component.")

      }
    )
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  //#region TIENEN QUE MODIFICAR EL SERIVCIO CON SU GETALL
  exportToExcel() {
    this.ownerPlotService.giveAllPlotsByOwner(this.ownerId, 0, this.LIMIT_32BITS_MAX).subscribe(
      response => {
        this.excelService.exportListToExcel(response.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error => {
        console.log("Error retrieved all, on export component.")
      }
    )
  }
  //#endregion

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

      const filteredList = this.itemsList.filter(item => {
        return Object.values(item).some(prop => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          const translations = this.dictionaries && this.dictionaries.length
            ? this.dictionaries.map(dict => this.translateDictionary(propString, dict)).filter(Boolean)
            : [];

          return propString.includes(filterValue) || translations.some(trans => trans?.toLowerCase().includes(filterValue));
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

  /**
   * Redirects to the specified form path.
   */
  redirectToForm() {
    this.router.navigate([this.formPath]);
  }
}
