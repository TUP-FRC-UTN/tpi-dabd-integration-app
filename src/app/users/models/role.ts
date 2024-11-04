/**
 * Represents a role with details such as code, name, and description, as well as its active status.
 */
export interface Role {
  /** Unique identifier of the role */
  id: number;
  /** Numeric code associated with the role */
  code: number;
  /** Technical name of the role */
  name: string;
  /** Display-friendly name of the role */
  prettyName: string;
  /** Description of the role’s responsibilities or purpose */
  description: string;
  /** Indicates if the role is currently active */
  active: boolean;
}
