export interface Company {
    id: number;
    name: string;
    registration: Date;
    enabled: boolean;
}

export interface CompanyRequest {
    name: string;
}