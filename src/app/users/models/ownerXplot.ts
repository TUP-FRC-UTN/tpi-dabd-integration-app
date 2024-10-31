import { StateKYC } from "./owner";

export interface OwnerPlotHistoryDTO {
    id: number;
    firstName: string;
    lastName: string;
    ownerType: string;
    documentNumber: string;
    documentType: string;
    startDate: Date | null;
    dueDate?: Date | null;
}


export interface ValidateOwner {
    ownerId: number;
    plotId: number;
    kycStatus: StateKYC;
    roles?: string[]
}