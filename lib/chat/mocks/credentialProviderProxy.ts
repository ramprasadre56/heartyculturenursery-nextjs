/*
 * Copyright 2026 UCP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Credential, PaymentInstrument, PaymentMethod } from '@/lib/chat/types';

/**
 * A mock CredentialProvider to simulate calls to a remote service for credentials.
 * In a real application, this would make a network request to a provider's service.
 */
export class CredentialProviderProxy {
  handler_id = 'example_payment_provider';
  handler_name = 'example.payment.provider';
  merchantUrl = 'https://ucp-merchant-server-430410298641.us-central1.run.app';

  async getSupportedPaymentMethods(
    user_email: string,
    config: any,
  ): Promise<{ payment_method_aliases: PaymentMethod[] }> {
    console.log(
      'CredentialProviderProxy: Fetching supported payment methods from',
      this.merchantUrl,
    );

    try {
      const response = await fetch(`${this.merchantUrl}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email,
          config,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to empty or re-throw depending on desired behavior.
      // For now returning empty to avoid breaking the UI completely if server is incompatible.
      return { payment_method_aliases: [] };
    }
  }

  async getPaymentToken(
    user_email: string,
    payment_method_id: string,
  ): Promise<PaymentInstrument | undefined> {
    console.log(
      `CredentialProviderProxy: Fetching payment token for user ${user_email}`,
    );

    try {
      const response = await fetch(`${this.merchantUrl}/payment-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email,
          payment_method_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment token: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment token:', error);
      return undefined;
    }
  }
}
