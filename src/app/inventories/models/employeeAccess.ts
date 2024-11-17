export interface EmployeeAccess{
    firstName:string,
    lastName:string,
    visitorType:string, //EMPLOYEE
    docType:string, //DNI?
    docNumber:string,
    action:Action,
    actionDate:Date,
    vehicleType:string, //FOOT
    comments:string,
    isLate:boolean
}

export enum Action{
    entry= 'ENTRY',
    exit= 'EXIT'
}