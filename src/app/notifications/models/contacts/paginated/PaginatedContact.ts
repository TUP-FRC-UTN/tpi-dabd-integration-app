import { ContactModel } from "../contactModel";

export interface PaginatedContacts {
    content: ContactModel[];
    totalElements: number;
    totalPages: number;
    number: number; 
  }


  /*

  export interface ContactDTO {
    id: number;
    contact_value: string;
    contact_type: string;
    subscriptions: string[];
    active: boolean;
  }
  
  */
  
  