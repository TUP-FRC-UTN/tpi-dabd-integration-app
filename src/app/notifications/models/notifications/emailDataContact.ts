import { Variable } from "../variables"

export interface EmailDataContactApi {
    subject: string
    variables: Variable[]
    template_id : number
    contact_ids: number[]
}
export interface EmailDataContact {
    subject: string
    variables: Variable[]
    templateId : number
    contactIds: number[]
}
