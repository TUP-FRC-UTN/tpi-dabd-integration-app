import {inject, Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import {ToastService} from "ngx-dabd-grupo01";

@Injectable({
  providedIn: 'root',
})
export class CadastreExcelService {
  private toastService = inject(ToastService)

  /**
   * Export the given HTML table element to an Excel file (.xlsx).
   *
   * @param table - The HTMLTableElement that will be exported.
   * @param excelFileName - The desired name for the Excel file (without extension).
   */
  exportTableToExcel(table: HTMLTableElement, excelFileName: string): void {
    const clonedTable = table.cloneNode(true) as HTMLTableElement;

    Array.from(clonedTable.rows).forEach((row) => {
      row.deleteCell(row.cells.length - 1);
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `${excelFileName}.xlsx`);
  }

  /**
   * Export the given list of objects to an Excel file (.xlsx).
   *
   * @param dataObjects - The list of objects to be exported.
   * @param excelFileName - The desired name for the Excel file (without extension).
   */
  exportListToExcel<T>(dataObjects: any[], excelFileName: string): void {
    if (dataObjects.length === 0) {
      console.error('No data to export.');
      return;
    }

    const headers = Object.keys(dataObjects[0]);

    const data = dataObjects.map((obj) => {
      const row: { [key: string]: any } = {};
      headers.forEach((header) => {
        row[header] = obj[header];
      });
      return row;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      header: headers,
    });

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `${excelFileName}.xlsx`);
  }

  /**
   * Export the given HTML table element to a PDF file.
   *
   * @param table - The HTMLTableElement that will be exported.
   * @param pdfFileName - The desired name for the PDF file (without extension).
   */
  exportTableToPdf(table: HTMLTableElement, pdfFileName: string): void {
    const removedCells: HTMLTableCellElement[] = [];

    Array.from(table.rows).forEach((row) => {
      const removedCell = row.cells[row.cells.length - 1];
      removedCells.push(removedCell);
      row.deleteCell(row.cells.length - 1);
    });

    html2canvas(table).then((canvas: any) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${pdfFileName}.pdf`);

      Array.from(table.rows).forEach((row, index) => {
        if (removedCells[index]) {
          row.appendChild(removedCells[index]);
        }
      });
    });
  }

  /**
   * Export the given list of objects to a PDF file, where each property represents a column.
   *
   * @param data - The list of objects to be exported.
   * @param pdfFileName - The desired name for the PDF file (without extension).
   */

  exportListToPdf(
    data: any[],
    pdfFileName: string,
    headers: string[],
    dataMapper: (item: any) => any[]
  ): void {
    if (data.length === 0) {
      this.toastService.sendError("No hay datos para exportar.")
      return;
    }

    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text(pdfFileName, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data.map(dataMapper),
    });

    // Guardar el PDF después de agregar la tabla
    doc.save(pdfFileName);
    console.log('PDF exportado');
  }
}


