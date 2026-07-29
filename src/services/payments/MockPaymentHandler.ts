import type {
  PaymentHandler,
  PaymentIntent,
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundInput,
} from '../../types/payment';
import { generateId } from '../../utils/format';

/**
 * Mock payment handler for development until Stripe is integrated.
 * Payment secrets are NEVER placed in the mobile application.
 */
export class MockPaymentHandler implements PaymentHandler {
  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return {
      id: `pi_mock_${generateId()}`,
      provider: 'mock',
      amount: input.amount,
      currency: input.currency ?? 'USD',
      status: 'succeeded',
      rentalId: input.rentalId,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<PaymentIntent> {
    return {
      id: input.paymentIntentId,
      provider: 'mock',
      amount: 0,
      currency: 'USD',
      status: 'succeeded',
      rentalId: '',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async refund(input: RefundInput): Promise<PaymentIntent> {
    return {
      id: input.paymentIntentId,
      provider: 'mock',
      amount: input.amount ?? 0,
      currency: 'USD',
      status: 'refunded',
      rentalId: '',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
    return {
      id,
      provider: 'mock',
      amount: 0,
      currency: 'USD',
      status: 'succeeded',
      rentalId: '',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
