import { StateKYC } from './owner';

/**
 * Represents the history of an owner's association with a plot, including identification and time periods.
 */
export interface OwnerPlotHistoryDTO {
  /** Unique identifier of the ownership history record */
  id: number;
  /** First name of the owner */
  firstName: string;
  /** Last name of the owner */
  lastName: string;
  /** Type of owner, such as person or company */
  ownerType: string;
  /** Document number used for owner identification */
  documentNumber: string;
  /** Type of document, e.g., DNI or passport */
  documentType: string;
  /** Start date of the ownership period */
  startDate: Date | null;
  /** Optional end date of the ownership period */
  dueDate?: Date | null;
}

/**
 * Represents the data required to validate an owner for a plot, including KYC status and roles.
 */
export interface ValidateOwner {
  /** Unique identifier of the owner */
  ownerId: number;
  /** Unique identifier of the plot associated with the owner */
  plotId: number;
  /** Current KYC status of the owner */
  kycStatus: StateKYC;
  /** Optional list of roles associated with the owner */
  roles?: string[];
}
