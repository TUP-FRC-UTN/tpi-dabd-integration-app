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
    amountSign: ChargeType;
    
}

export interface Charges {
    amount: number;
    categoryCharge: CategoryCharge;
    chargeId: number;
    date: Date;
    fineId: number;
    lotId: number;
    period: PeriodCharge;
    status: boolean;
    description: string;
    amountSign: ChargeType;
    plotNumber?: number;
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

export  class Periods {
    month: number = 0;
    year: number = 0;
    id: number = 0;
    state: string="";
    start_date: Date = new Date();
    end_date: Date = new Date();
}

export enum ChargeFilters {
    NOTHING = 'NOTHING',
    PERIOD_ID = 'PERIOD_ID',
    LOT_NUMBER = 'LOT_NUMBER',
    CATEGORY_CHARGE = 'CATEGORY_CHARGE',
    CHARGE_TYPE = 'CHARGE_TYPE'
}

export enum ChargeType {
    ABSOLUTE = 'Positivo',
    NEGATIVE = 'Negativo',
    PERCENTAGE = 'Porcentaje'
}
