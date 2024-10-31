import { Address, Contact } from "./owner";
import { Role } from "./role";

export interface User {
    id?: number;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    isActive: boolean;
    addresses?: Address[];
    contacts?: Contact[];
    roles?: Role[];
    plotId? : number
}