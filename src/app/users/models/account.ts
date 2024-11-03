export interface Account {
    id : number, 
    plotId : number,
    balance : number,
}

export interface AccountingConcept {
    plotId: number;
    accountingDate: Date;
    concept: string;
    comments: string;
    amount: number;
    documentId: number;
}

export const ConceptTypes: { [key: string]: string } = {
    "Pago": "PAYMENT",
    "Expensa Comun": "COMMON_EXPENSE",
    "Expensa Extraordinaria": "EXTRAORDINARY_EXPENSE"
};