export interface FileUploadData {
  file: File;
  fileType: string;
  fileName: string
}

/**
 * The `BatchFileType` enum represents different types of files
 * associated with a plot process. It specifies various categories
 * of files that can be used, such as documentation or sale files.
 */
export enum BatchFileType {
    PURCHASE_SALE = 'Escritura',
    ID_DOCUMENT_FRONT = 'Frente Documento',
    ID_DOCUMENT_BACK = 'Dorso Documento',
  }

  // ver de aca cuales tienen que quedar
  

export interface Document {
    id: number,
    fileType: string;
    name: string;
    contentType: string;
    url: string;
    approvalStatus: string;
    reviewNote: string;
    isActive: boolean;
}

export interface FileTypeMap {
  type_map: {[key: string]: string};
  // typeMap: Map<String, String>;
}

export interface FileWithTypes {
  id?: string,
  file: File,
  type: BatchFileType
}

export const FileTypeDictionary: { [key: string]: string } = {
    "Escritura": "PURCHASE_SALE",
    "Doc. Frente": "ID_DOCUMENT_FRONT",
    "Doc. Dorso": "ID_DOCUMENT_BACK",
};

export const FileStatusDictionary: { [key: string]: string } = {
    "Cargado": "UPLOADED",
    "Revisado": "REVIEWED_WITH_NOTES",
    "Pre-Aprobado": "PRE_APPROVED",
    "Aprobado": "APPROVED",
    "Modificar": "MODIFICATION_PERMIT_GRANTED",
    "Rechazado": "REJECTED"
};
