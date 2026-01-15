
import { UCPCheckout, UCPCreateCheckoutRequest } from '@/types/ucp';
import { v4 as uuidv4 } from 'uuid';

const UCP_API_URL = process.env.NEXT_PUBLIC_UCP_API_URL || '/api/merchant';

// Helper to generate required UCP headers
const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'UCP-Agent': 'profile="http://localhost/mock-profile"', // Use localhost to avoid DNS errors in backend
        'request-signature': 'test',
        'idempotency-key': uuidv4(),
        'request-id': uuidv4(),
    };
};

export const createCheckout = async (checkoutData: UCPCreateCheckoutRequest): Promise<UCPCheckout> => {
    try {
        const response = await fetch(`${UCP_API_URL}/checkout-sessions`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                ...checkoutData,
                payment: {
                    handlers: [{
                        id: "mock_payment",
                        name: "mock.payment",
                        version: "1.0",
                        spec: "https://example.com/spec",
                        config_schema: "https://example.com/schema",
                        instrument_schemas: ["https://example.com/schema"],
                        config: {}
                    }],
                    instruments: []
                },
                fulfillment: {
                    root: {
                        methods: [{
                            type: "shipping",
                            destinations: [{
                                root: {
                                    id: "dest_1",
                                    address_country: "US"
                                }
                            }],
                            selected_destination_id: "dest_1",
                            groups: [{
                                selected_option_id: "std-ship"
                            }]
                        }]
                    }
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create checkout:', response.status, errorText);
            throw new Error(`Failed to create checkout: ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating checkout:', error instanceof Error ? error.message : error);
        throw error;
    }
};

export const getCheckout = async (checkoutId: string): Promise<UCPCheckout> => {
    try {
        const response = await fetch(`${UCP_API_URL}/checkout-sessions/${checkoutId}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to get checkout: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting checkout:', error);
        throw error;
    }
};
