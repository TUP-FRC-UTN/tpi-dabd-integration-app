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