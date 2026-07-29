/**
 * Payment provider abstraction layer.
 * This allows Stripe integration later without coupling payment logic to UI.
 */
export type PaymentProvider = 'stripe' | 'mock';

export type PaymentStatus =
  'pending' | 'requires_confirmation' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  type: 'card' | 'wallet';
  lastFour: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  rentalId: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentInput {
  rentalId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
  paymentMethodId: string;
}

export interface RefundInput {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

export interface PaymentHandler {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent>;
  confirmPayment(input: ConfirmPaymentInput): Promise<PaymentIntent>;
  refund(input: RefundInput): Promise<PaymentIntent>;
  getPaymentIntent(id: string): Promise<PaymentIntent | null>;
}
