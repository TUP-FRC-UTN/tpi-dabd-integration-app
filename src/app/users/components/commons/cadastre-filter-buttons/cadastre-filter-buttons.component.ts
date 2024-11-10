import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Owner } from '../../../models/owner';
import { Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { PlotTypeDictionary, PlotStatusDictionary } from '../../../models/plot';
import { OwnerService } from '../../../services/owner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastre-filter-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cadastre-filter-buttons.component.html',
  styleUrl: './cadastre-filter-buttons.component.css'
})
export class CadastreFilterButtonsComponent implements OnInit{


  private router = inject(Router);
  
   // Inject the Excel service for export functionality
   private excelService = inject(CadastreExcelService);

   // inject OwnerService
   private ownerService = inject(OwnerService);


  // Input to receive the HTML table from the parent
  @Input() tableName!: HTMLTableElement;
  
  // Input to receive the list of owners from the parent component
  @Input() ownersList!: Owner[];
  
  // Input to redirect to the form.
  @Input() formPath: string = "/users/owner/form";
  // Represent the name of the object for the exports.
  // Se va a usar para los nombres de los archivos.
  @Input() objectName : string = ""
  // Represent the dictionaries of ur object.
  // Se va a usar para las traducciones de enum del back.
  @Input() dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<Owner[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

 
  ngOnInit(): void {
    
  }

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
  exportToPdf(){
    this.excelService.exportTableToPdf(this.tableName, 'owners_table' + this.getActualDayFormat());
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  exportToExcel(){
    this.excelService.exportTableToExcel(this.tableName, 'owners_table' + this.getActualDayFormat());
  }

  /**
   * Filters the list of owners based on the input value in the text box.
   * The filter checks if any property of the owner contains the search string (case-insensitive).
   * The filtered list is then emitted through the `filterSubject`.
   * 
   * @param event - The input event from the text box.
   */
  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const filterValue = target.value.toLowerCase();

    let filteredList = this.ownersList.filter(owner => {
      return Object.values(owner).some(prop => {
        const propString = prop ? prop.toString().toLowerCase() : '';

        // Validar que dictionaries esté definido y tenga elementos antes de mapear
        const translations = this.dictionaries && this.dictionaries.length
          ? this.dictionaries.map(dict => this.translateDictionary(propString, dict)).filter(Boolean)
          : [];

        // Se puede usar `includes` para verificar si hay coincidencias
        return propString.includes(filterValue) || translations.some(trans => trans?.toLowerCase().includes(filterValue));
      });
    });
    
    this.filterSubject.next(filteredList);
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
