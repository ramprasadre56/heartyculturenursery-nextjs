


async function testBackend() {
    const payload = {
        id: "test_inr_order_" + Date.now(),
        currency: "INR",
        line_items: [{
            item: {
                id: "bouquet_roses",
                title: "Bouquet of Red Roses",
                price: 35000 // 350.00 INR
            },
            quantity: 1
        }],
        buyer: {
            full_name: "Test User",
            email: "test@example.com"
        },
        payment: {
            handlers: [{
                id: "stripe",
                name: "Stripe",
                config: { publishable_key: "pk_test_123" }
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
                            address_country: "IN"
                        }
                    }],
                    selected_destination_id: "dest_1",
                    groups: [{ selected_option_id: "std-ship" }]
                }]
            }
        }
    };

    const headers = {
        'Content-Type': 'application/json',
        'UCP-Agent': 'profile="http://localhost/mock-profile"',
        'request-signature': 'test',
        'idempotency-key': Date.now().toString(),
        'request-id': Date.now().toString()
    };

    try {
        const response = await fetch('http://localhost:8182/checkout-sessions', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${text}`);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testBackend();
