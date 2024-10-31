import { Bill } from "./bill"
import BillType from "./billType"
import Category from "./category"
import Period from "./period"

export default class LiquidationExpense{
    expense_id:number |null=null
    liquidation_expenses_details:LiquidationExpenseDetail[]=[]
    solicitacion_date:Date = new Date()
    bill_type: BillType|null=null
    period:Period|null=null
    total_amount:number|null=null
    close:boolean=false
    blocked:boolean=false
}

class LiquidationExpenseDetail {
    id:number|null=null

    amount:number|null=null

    category:Category|null=null

    bills:Bill[]=[]

    quantity:number|null=null
}

