import { environment } from "../../environments/environment"

export const PORT = environment.production ? `${environment.apis.expenses}` : `${environment.apis.expenses}`
