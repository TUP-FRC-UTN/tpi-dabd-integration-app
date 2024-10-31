import Period from "./period";

export interface Charge2 {
    id: number;
    fechaEmision: string;
    lote: number;
    tipo: string;
    periodo: PeriodCharge;
    monto: number;
    descripcion: string;
}

export interface Charge {    
    amount: number;
    categoryCharge: CategoryCharge;
    chargeId: number;
    date: Date;
    fineId: number;
    lotId: number;
    period: PeriodCharge;
    status: boolean;
    description: string;
    
}

export interface CategoryCharge {
    categoryChargeId: number;
    description: string;
    name: string;
}

export interface PeriodCharge {
    month: number;
    year: number ;
    state:string;
    id: number ;
}

export enum ChargeFilters {
    NOTHING = 'NOTHING',
    PERIOD_ID = 'PERIOD_ID',
    LOT_NUMBER = 'LOT_NUMBER',
    CATEGORY_CHARGE = 'CATEGORY_CHARGE'
}