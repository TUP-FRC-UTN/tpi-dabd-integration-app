export interface Visitor {
  visitorId: number;
  ownerId: number;
  loaderId: string;
  loaderName: string;
  name: string;
  lastName: string;
  visitorTypes:string[];
  docType:string;
  docNumber: string;
  birthDate: any;
  isActive: boolean;
}

export interface SendVisitor {
  name: string;
  lastName: string;
  docNumber: string;
  birthDate: any;
  isActive: boolean;
}
