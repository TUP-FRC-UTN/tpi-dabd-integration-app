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
    CUIT_FRONT = 'Frente CUIT',
    CUIT_BACK = 'Dorso CUIT',
    OTHER = 'Otro',
  }
  

export interface Document {
    id: number;
    fileType: string;
    name: string;
    contentType: string;
    url: string;
    approvalStatus: string;
    reviewNote: string;
    isActive: boolean;
}

export const FileTypeDictionary: { [key: string]: string } = {
    "Escritura": "PURCHASE_SALE",
    "Doc Frente": "ID_DOCUMENT_FRONT",
    "Doc Dorso": "ID_DOCUMENT_BACK",
    "CUIT Frente": "CUIT_FRONT",
    "CUIT Dorso": "CUIT_BACK",
    "Otro": "OTHER"
};

export const FileStatusDictionary: { [key: string]: string } = {
    "Cargado": "UPLOADED",
    "Revisado": "REVIEWED_WITH_NOTES",
    "Pre-Aprobado": "PRE_APPROVED",
    "Aprobado": "APPROVED",
    "Modificar": "MODIFICATION_PERMIT_GRANTED",
    "Rechazado": "REJECTED"
};
