import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PaymentExcelService {
  constructor() {}

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
  exportListToPdf = (data: any[], pdfFileName: string): void => {
    if (data.length === 0) {
      console.error('No data to export.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
  
    pdf.setFontSize(10);
  
    let yPosition = 10;
    const lineHeight = 6;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const cellPadding = 5;

    const headers = Object.keys(data[0]);
  
    const columnWidth = (pageWidth - cellPadding * 2) / headers.length;
  
    headers.forEach((header, index) => {
      pdf.text(header, cellPadding + index * (columnWidth), yPosition);
    });
  
    yPosition += lineHeight;
  
    data.forEach((item) => {
      headers.forEach((header, index) => {
        const text = String(item[header]);
        pdf.text(text, cellPadding + index * (columnWidth), yPosition);
      });
      yPosition += lineHeight;
  
      if (yPosition > pdf.internal.pageSize.getHeight() - 10) {
        pdf.addPage();
        yPosition = 10;
      }
    });
  
    pdf.save(`${pdfFileName}.pdf`);
  };


  exportToExcel<T>(
    data: T[],
    columns: { header: string; accessor: (item: T) => any }[],
    fileName: string,
    sheetName: string
  ): void {
    // Mapea los datos utilizando los accesorios de las columnas
    const formattedData = data.map((item) =>
      columns.reduce((acc, col) => {
        acc[col.header] = col.accessor(item);
        return acc;
      }, {} as { [key: string]: any })
    );

    // Crea una hoja de trabajo de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Ajusta el ancho de las columnas
    const columnWidths = columns.map((col) => {
      const maxLength = Math.max(
        col.header.length,
        ...formattedData.map((row) => (row[col.header] ? row[col.header].toString().length : 0))
      );
      return { wch: maxLength + 2 };
    });

    ws['!cols'] = columnWidths;

    // Agrega la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Genera el archivo Excel
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
