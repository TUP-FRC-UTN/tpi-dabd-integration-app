import { Address, Contact } from './owner';
import { Role } from './role';

/**
 * Represents a user with personal information, contact details, and associated roles and addresses.
 */
export interface User {
  /** Unique identifier of the user */
  id?: number;
  /** First name of the user */
  firstName: string;
  /** Last name of the user */
  lastName: string;
  /** Username used for logging in or identification */
  userName: string;
  /** Email address of the user */
  email: string;
  /** Indicates if the user is currently active */
  isActive: boolean;
  /** Optional list of addresses associated with the user */
  addresses?: Address[];
  /** Optional list of contacts associated with the user */
  contacts?: Contact[];
  /** Optional list of roles assigned to the user */
  roles?: Role[];
  /** Optional plot identifier associated with the user */
  plotId?: number;
  ownerId?:number;
}
