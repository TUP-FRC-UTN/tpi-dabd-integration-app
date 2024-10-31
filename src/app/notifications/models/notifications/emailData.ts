import { Variable } from "../variables";

export interface EmailDataApi {
    recipient: string;
    subject: string;
    variables: Variable[];
    template_id: number;
}
export interface EmailData {
    recipient: string;
    subject: string;
    variables: Variable[];
    templateId: number;
}
