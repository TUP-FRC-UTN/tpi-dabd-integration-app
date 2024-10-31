import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadData } from '../models/file';

@Injectable({
  providedIn: 'root'
})
export class LoadFileService {

  private uploadUrl = 'http://localhost:8282/owners';

  constructor(private http: HttpClient) { }

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
    headerUserId: number,
    filesData: FileUploadData[]
  ): Observable<File[]> {
    
    const formData = new FormData();
    
    filesData.forEach((fileData, index) => {
      if (fileData.file instanceof File) {
        formData.append('files', this.updateFileNameAndType(fileData.file, fileData.fileName));
        // formData.append(`type[${index}]`, fileData.fileType); 
      } else {
        console.error(`Expected fileData.file to be of type File, but got ${typeof fileData.file}`);
      }
    });
    formData.append(`type`, filesData[0].fileType); // TODO: EL BACK NO SOPORTA MULTIPLES TYPES

    const headers = new HttpHeaders({
      'x-user-id': headerUserId.toString()
    });
    return this.http.post<File[]>(`${this.uploadUrl}/${ownerId}/files`, formData, { headers });
  }

  updateFileNameAndType(file: File, newName: string): File {
    const newFile = new File([file], newName);
    return newFile;
  }
}
