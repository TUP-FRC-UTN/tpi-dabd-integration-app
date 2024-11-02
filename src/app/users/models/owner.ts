export interface Address {
    id?: number;
    streetAddress: string;
    number: number;
    floor: number;
    apartment: string;
    city: string;
    province: string;
    country: string;
    postalCode: number | null;
}

export interface Contact {
    id?: number;
    contactType?: string;
    contactValue?: string;
    subscriptions?: string[];
    value?: string;
  }



export interface Files {

}

export enum StateKYC {
    INITIATED = "INITIATED",
    TO_VALIDATE = "TO_VALIDATE",
    VALIDATED = "VALIDATED",
    CANCELED = "CANCELED"
}

export interface OwnerResponse {
    id?: number;
    first_name: string;
    second_name: string;
    last_name: string;
    owner_type: string;
    document_number: string;
    document_type: string;
    cuit: string;
    bank_account: string;
    birthdate: string;
    kyc_status?: StateKYC;
    is_active?: boolean;
    addresses: Address[];
    contacts: Contact[];
}

export interface Owner {
    id?: number;
    firstName: string;
    secondName: string;
    lastName: string;
    ownerType: string;
    documentNumber: string;
    documentType: string;
    cuit: string;
    bankAccount: string;
    birthdate: string;
    kycStatus?: StateKYC;
    isActive?: boolean;
    addresses: Address[];
    contacts: Contact[] | Contact;
    plotId: number | undefined;
}

export enum OwnerType {
    PERSON,
    COMPANY,
    OTHER
}

export enum DocumentType {
    DNI,
    PASAPORTE
}

export const DocumentTypeDictionary: { [key: string]: string } = {
    "DNI": "P",
    "Cédula": "I",
    "Pasaporte": "T"
};

export const OwnerTypeDictionary: { [key: string]: string } = {
    "Persona": "PERSON",
    "Compañía": "COMPANY",
    "Otro": "OTHER"
};

export const OwnerStatusDictionary: { [key: string]: string } = {
    "Iniciado": "INITIATED",
    "Para Validar": "TO_VALIDATE",
    "Validado": "VALIDATED",
    "Cancelado": "CANCELED"
};



export enum OwnerFilters {
    NOTHING = 'NOTHING',
    DOC_TYPE = 'DOC_TYPE',
    OWNER_TYPE = 'OWNER_TYPE'
  }
