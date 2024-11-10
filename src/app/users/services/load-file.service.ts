import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadData, Document, FileTypeMap } from '../models/file';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class LoadFileService {
  private ownerUploadUrl: string = environment.production
    ? `${environment.apis.cadastre}owners`
    : 'http://localhost:8004/owners';
  

  private fileUploadUrl: string = environment.production
    ? `${environment.apis.cadastre}files`
    : 'http://localhost:8004/files';

    private sessionService = inject(SessionService);

  constructor(private http: HttpClient) {}

  /**
   * Uploads files associated with an owner.
   *
   * @param ownerId The ID of the owner to associate the files with.
   * @param headerUserId The ID of the user making the request (header).
   * @param filesData An array of files along with their respective types.
   * @returns An Observable containing a list of uploaded files.
   */
  uploadFiles(
    ownerId: number,
    filesData: FileUploadData[]
  ): Observable<File[]> {
    const formData = new FormData();

    filesData.forEach((fileData, index) => {
      if (fileData.file instanceof File) {
        formData.append(
          'files',
          this.updateFileNameAndType(fileData.file, fileData.fileName)
        );
        // formData.append(`type[${index}]`, fileData.fileType);
      } else {
        console.error(
          `Expected fileData.file to be of type File, but got ${typeof fileData.file}`
        );
      }
    });
    formData.append(`type`, filesData[0].fileType); // TODO: EL BACK NO SOPORTA MULTIPLES TYPES

    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });
    return this.http.post<File[]>(
      `${this.ownerUploadUrl}/${ownerId}/files`,
      formData,
      { headers }
    );
  }

  /*   uploadFilesNacho(files: File[], fileTypeMap: FileTypeMap, ownerId: number, headerUserId: number): Observable<Document[]> {
    const formData = new FormData();
    formData.append(
      'typeMap',
      new Blob(
        [
          JSON.stringify(fileTypeMap),
        ],
        {
          type: 'application/json',
        }
      )
    );
    files.forEach(file => formData.append('files', file));
    const headers = new HttpHeaders({
      'x-user-id': headerUserId.toString()
    });
    return this.http.post<Document[]>(`${this.ownerUploadUrl}/${ownerId}/files`, formData, { headers });
  } */

  // metodo para subir archivos de Owners
  uploadFilesOwner(files: File[], fileTypeMap: FileTypeMap, ownerId: number): Observable<Document[]> {
    
    const formDataOwner = new FormData();
    formDataOwner.append(
      'typeMap',
      new Blob([JSON.stringify(fileTypeMap)], {
        type: 'application/json',
      })
    );
    files.forEach((file) => {
      if (
        fileTypeMap.type_map[file.name] === 'ID_DOCUMENT_FRONT' ||
        fileTypeMap.type_map[file.name] === 'ID_DOCUMENT_BACK'
      ) {
        formDataOwner.append('files', file);
      }
    });

    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });
    return this.http.post<Document[]>(
      `${this.ownerUploadUrl}/${ownerId}/files`,
      formDataOwner,
      { headers }
    );
  }

  // metodo para subir archivos de Plots
  uploadFilesPlot(files: File[], fileTypeMap: FileTypeMap, plotId: number): Observable<Document[]> {

    const formDataPlot = new FormData();
    formDataPlot.append(
      'typeMap',
      new Blob([JSON.stringify(fileTypeMap)], {
        type: 'application/json',
      })
    );
    files.forEach((file) => {
      if (fileTypeMap.type_map[file.name] === 'PURCHASE_SALE') {
        formDataPlot.append('files', file);
      }
    });

    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });
    return this.http.post<Document[]>(
      `${this.fileUploadUrl}/${plotId}/files`,
      formDataPlot,
      { headers }
    );
  }


  updateFile(fileId: number, fileType: string, file: File): Observable<Document> {

    const formData = new FormData();
    formData.append('type', fileType);
    formData.append('file', file);

    const headers = new HttpHeaders({
      'x-user-id': this.sessionService.getItem('user').id.toString()
    });

    return this.http.put<Document>(
      this.fileUploadUrl + '/' + fileId,
      formData,
      { headers }
    );
  }

  updateFileNameAndType(file: File, newName: string): File {
    const newFile = new File([file], newName);
    return newFile;
  }
}
