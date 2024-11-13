/**
 * Represents an address with details such as street, number, city, and postal code.
 */
export interface Address {
  /** Unique identifier of the address */
  id?: number;
  /** The street name or address line */
  streetAddress: string;
  /** The street number */
  number: number;
  /** The floor number of the address */
  floor: number;
  /** The apartment identifier */
  apartment: string;
  /** The city where the address is located */
  city: string;
  /** The province or state of the address */
  province: string;
  /** The country of the address */
  country: string;
  /** The postal or ZIP code */
  postalCode: number | null;

}

/**
 * Represents a contact with a specified type and value, including optional subscriptions.
 */
export interface Contact {
  /** Unique identifier of the contact */
  id?: number;
  /** The type of contact, e.g., email, phone */
  contactType?: string;
  /** The contact value, e.g., email address or phone number */
  contactValue?: string;
  /** List of subscriptions associated with this contact */
  subscriptions?: string[];
  /** General contact value */
  value?: string;
}

/**
 * Represents file information associated with an owner or entity.
 * Currently, no fields are specified.
 */
export interface Files {}

/**
 * Enumeration of possible KYC (Know Your Customer) states for an owner.
 */
export enum StateKYC {
  INITIATED = 'INITIATED',
  TO_VALIDATE = 'TO_VALIDATE',
  VALIDATED = 'VALIDATED',
  CANCELED = 'CANCELED',
}

/**
 * Represents an owner's response details, including personal information and associated addresses and contacts.
 */
export interface OwnerResponse {
  /** Unique identifier of the owner */
  id?: number;
  /** Owner's first name */
  first_name: string;
  /** Owner's middle or second name */
  second_name: string;
  /** Owner's last name */
  last_name: string;
  /** Type of owner, e.g., person, company */
  owner_type: string;
  /** Document number for identification */
  document_number: string;
  /** Type of document for identification */
  document_type: string;
  /** CUIT number, a tax identification number */
  cuit: string;
  /** Bank account associated with the owner */
  bank_account: string;
  /** Birthdate of the owner */
  birthdate: string;
  /** Current KYC status */
  kyc_status?: StateKYC;
  /** Active status of the owner */
  is_active?: boolean;
  /** List of addresses associated with the owner */
  addresses: Address[];
  /** List of contacts associated with the owner */
  contacts: Contact[];
}

/**
 * Represents an owner's details, including addresses, contacts, and plot information.
 */
export interface Owner {
  /** Unique identifier of the owner */
  id?: number;
  /** Owner's first name */
  firstName: string;
  /** Owner's middle or second name */
  secondName: string;
  /** Owner's last name */
  lastName: string;
  /** Type of owner, e.g., person, company */
  ownerType: string;
  /** Document number for identification */
  documentNumber: string;
  /** Type of document for identification */
  documentType: string;
  /** CUIT number, a tax identification number */
  cuit: string;
  /** Bank account associated with the owner */
  bankAccount: string;
  /** Birthdate of the owner */
  birthdate: string;
  /** Current KYC status */
  kycStatus?: StateKYC;
  /** Active status of the owner */
  isActive?: boolean;
  /** List or single instance of contacts associated with the owner */
  contacts: Contact[] | Contact;
  /** Identifier for the plot associated with the owner */
  plotId: number | undefined;
  /** List of addresses associated with the owner */
  addresses: Address[];
}

/**
 * Enumeration representing types of owners.
 */
export enum OwnerType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
  OTHER = 'OTHER',
}

/**
 * Enumeration representing types of documents.
 */
export enum DocumentType {
  DNI,
  PASAPORTE,
}

/**
 * Dictionary for document types with their abbreviations.
 */
export const DocumentTypeDictionary: { [key: string]: string } = {
  DNI: 'DNI',
  Cédula: 'ID',
  Pasaporte: 'PASSPORT',
};

/**
 * Dictionary for owner types with their descriptions.
 */
export const OwnerTypeDictionary: { [key: string]: string } = {
  Persona: 'PERSON',
  Compañía: 'COMPANY',
  Otro: 'OTHER',
};

/**
 * Dictionary for KYC statuses with their descriptions.
 */
export const OwnerStatusDictionary: { [key: string]: string } = {
  Iniciado: 'INITIATED',
  'Para Validar': 'TO_VALIDATE',
  Validado: 'VALIDATED',
  Cancelado: 'CANCELED',
};

/**
 * Enumeration representing possible filters for owners.
 */
export enum OwnerFilters {
  NOTHING = 'NOTHING',
  DOC_TYPE = 'DOC_TYPE',
  OWNER_TYPE = 'OWNER_TYPE',
}
