export interface PaystackWebhookEventData {
    event: string
    data: WebHookData
}

export interface WebHookData {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: null;
    gateway_response: string;
    paid_at: Date;
    created_at: Date;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
        payment_intent_id: string;
    };
    log: Log;
    fees: null;
    customer: Customer;
    authorization: Authorization;
}


export interface Log {
    time_spent: number;
    attempts: number;
    authentication: string;
    errors: number;
    success: boolean;
    mobile: boolean;
    channel: null;
    history: History[];
    [key: string]: unknown;
}

export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    customer_code: string;
    phone: null;
    metadata: null;
    risk_action: string;
}

export interface Authorization {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    account_name: string;
}
