import { Component, inject, Input } from '@angular/core';
import { Role } from '../../../models/role';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { Router } from '@angular/router';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-roles-filter-buttons',
  standalone: true,
  imports: [],
  templateUrl: './roles-filter-buttons.component.html',
  styleUrl: './roles-filter-buttons.component.css'
})
export class RolesFilterButtonsComponent<T extends Record<string, any>>{
  // Input to receive the HTML table from the parent
  // Input to receive the HTML table from the parent
  @Input() tableName!: HTMLTableElement;
  // Input to receive a generic list from the parent component
  @Input() itemsList!: T[];
  // Input to redirect to the form.
  @Input() formPath: string = "";
  // Represent the name of the object for the exports.
  // Se va a usar para los nombres de los archivos.
  @Input() objectName : string = ""

  headers : string[] = ['Código', 'Nombre', 'Nombre especial', 'Descripción', 'Activo']

  private dataMapper = (item: T) => [
    item["code"],
    item["name"],
    item["prettyName"],
    item['description'],  
    item['isActive']? 'Activo' : 'Inactivo',
  ];

  private LIMIT_32BITS_MAX = 2147483647

  private router = inject(Router);
  // Reemplazen con su servicio para el getAll.
  private roleService = inject(RoleService)
  // Subject to emit filtered results
  private filterSubject = new Subject<T[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  // Inject the Excel service for export functionality
  private excelService = inject(CadastreExcelService);

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
  exportToPdf() {
    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        this.excelService.exportListToPdf(data.content, `${this.getActualDayFormat()}_${this.objectName}`, this.headers, this.dataMapper);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  exportToExcel() {
    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        this.excelService.exportListToExcel(data.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
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
    if (target.value?.length <= 2) {
      this.filterSubject.next(this.itemsList);
    } else {
      let filterValue = target.value.toLowerCase();
      let filteredList = this.itemsList.filter(item => {
        return Object.values(item).some(prop => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          // Se puede usar `includes` para verificar si hay coincidencias
          return propString.includes(filterValue);
        });
      });

      this.filterSubject.next(filteredList);
    }
  }

  /**
   * Redirects to the specified form path.
   */
  redirectToForm() {
    console.log(this.formPath);
    this.router.navigate([this.formPath]);
  }

  downloadTable() {
    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        const toExcel = data.content.map(role => ({
          'Código': role.code,
          'Nombre': role.name,
          'Nombre especial': role.prettyName,
          'Descripción': role.description,  
          'Activo': role.active? 'Activo' : 'Inactivo'
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(toExcel);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

}
