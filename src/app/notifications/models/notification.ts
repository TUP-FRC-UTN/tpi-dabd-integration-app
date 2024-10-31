
export interface Notification {
    id: number// 1
    recipient: string//gabCollazo@hotmail.com
    subject: string;
    templateId: number // 1
    templateName: string // cuentas
    statusSend: string // enviado
    dateSend:string,   // 24/12/2002
    body : string 
}


export interface NotificationApi {
    id: number;
    recipient: string;
    contactId : number;
    subject: string;
    templateId: number;
    body : string;
    dateSend: string;
    isRead : boolean;
    statusSend : string;
    dateNotification : string
}
export interface NotificationFront {
    id: number;
    recipient: string;
    contactId : number;
    subject: string;
    templateId: number;
    body : string;
    dateSend: Date;
    isRead : boolean;
    statusSend : string;
    dateNotification : string
}

