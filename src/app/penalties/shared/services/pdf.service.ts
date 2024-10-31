import { Injectable, TemplateRef } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  downloadPDF(data: HTMLElement) {
    if (data) {
      // Guardar el estilo original de la visibilidad
      const originalDisplay = data.style.display;

      // Hacer visible el elemento
      data.style.display = 'block'; // O 'inline' según lo que necesites

      // Usar html2canvas
      html2canvas(data).then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save('MYPdf.pdf');

        // Restaurar el estilo original
        data.style.display = originalDisplay;
      });
    }
  }
  downloadPDF2(data: HTMLElement) {
    if (data) {
      // Guardar el estilo original de la visibilidad
      const originalDisplay = data.style.display;

      // Hacer visible el elemento
      data.style.display = 'block'; // O 'inline', según lo que necesites

      // Crear un nuevo jsPDF
      const width = 2000; // Ancho en mm
      const height = 3000; // Alto en mm (ejemplo para A4)
      const pdf = new jsPDF(undefined, 'px', [height, width]);
      // Usar html para agregar el contenido del HTML directamente al PDF
      pdf.html(data, {
        callback: () => {
          pdf.save('MYPdf.pdf');

          // Restaurar el estilo original
          data.style.display = originalDisplay;
        },
        x: 10, // Ajusta la posición X
        y: 10, // Ajusta la posición Y
      });
    }
  }
}
