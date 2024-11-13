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
    active: boolean;
    amountSign : ChargeType;
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


export interface ReportCharge {
    most_frequent_category:        string;
    most_frequent_category_amount: number;
    category_with_highest_amount:  string;
    category_highest_amount_value: number;
    total_charges_by_period:       number;
    most_frequent_fine_type:       string;
    most_frequent_fine_type_count: number;
    fines_count_by_period:         number;
    category_distribution_chart:   DistributionChart;
    fine_type_distribution_chart:  DistributionChart;
    top_lot_payment:               TopLotPayment[];
}

export interface DistributionChart {
    additionalProp1: number;
    additionalProp2: number;
    additionalProp3: number;
}

export interface TopLotPayment {
    lot_number:   number;
    total_amount: number;
}
