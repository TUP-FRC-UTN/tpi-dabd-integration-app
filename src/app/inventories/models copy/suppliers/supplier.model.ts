import { Company } from "./company.model";
import { Service } from "./service.model";

export interface Supplier {
    id: number;
    name: string;
    details: string;
    cuil: string;
    contact: string;
    address: string;
    company: Company;
    service: Service;
    registration: string;
    enabled: boolean;
}