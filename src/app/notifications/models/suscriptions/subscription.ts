export interface Subscription {
    id : number
    name : string
    isUnsubscribable : Boolean
}
export interface SubscriptionMod {
    contactId : number
    subscriptionId : number
    subscriptionValue : Boolean
}