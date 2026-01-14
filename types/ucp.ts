
export interface UCPItem {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
}

export interface UCPLineItem {
    id?: string;
    item: UCPItem;
    quantity: number;
    totals?: {
        type: string;
        amount: number;
        display_text?: string;
    }[];
}

export interface UCPBuyer {
    full_name?: string;
    email?: string;
    phone_number?: string;
}

export interface UCPConfig {
    [key: string]: any;
}

export interface UCPPaymentHandler {
    id: string;
    name: string;
    config?: UCPConfig;
}

export interface UCPPayment {
    handlers: UCPPaymentHandler[];
    instruments: any[];
}

export interface UCPCheckout {
    id: string;
    line_items: UCPLineItem[];
    buyer?: UCPBuyer;
    currency: string;
    status: string;
    totals: {
        type: string;
        amount: number;
        display_text?: string;
    }[];
    payment: UCPPayment;
    settings?: {
        [key: string]: any;
    }
}

export interface UCPCreateCheckoutRequest {
    line_items: {
        item: {
            id: string;
            title: string;
            price: number;
        };
        quantity: number;
    }[];
    buyer?: UCPBuyer;
    currency: string;
}
