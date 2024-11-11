import { Authorizer } from "../authorization/authorize.model";

export interface AccessModel {
  firstName: string;
  lastName: string;
  visitorType: string;
  authorizerId: number;
  docType: string;
  docNumber: number;
  authorizer: Authorizer;
  authFirstName: string;
  authLastName: string;
  authDocType: string;
  authDocNumber: number;
  action: string;
  vehicleType: string;
  carDescription: string | null;
  vehicleReg: string;          
  actionDate: string;
  vehicleDescription: string;
  comments: string;
}

export const AccessActionDictionary: { [key: string]: string } = {
  "Entrada": "ENTRY",
  "Salida": "EXIT",
};

export enum AccessFilters {
  NOTHING = 'NOTHING',
  ACTION = 'ACTION',
  DATE = 'DATE',
  VISITOR_TYPE = 'VISITOR_TYPE'
}
