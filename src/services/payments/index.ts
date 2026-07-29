import type { PaymentHandler } from '../../types/payment';
import { isMockDataEnabled } from '../../constants/env';
import { MockPaymentHandler } from './MockPaymentHandler';

let paymentHandler: PaymentHandler | null = null;

export function getPaymentHandler(): PaymentHandler {
  if (!paymentHandler) {
    if (isMockDataEnabled()) {
      paymentHandler = new MockPaymentHandler();
    } else {
      // Future: return StripePaymentHandler when integrated
      paymentHandler = new MockPaymentHandler();
    }
  }
  return paymentHandler;
}
