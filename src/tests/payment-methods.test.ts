import { MockPaymentHandler } from '../services/payments/MockPaymentHandler';

describe('MockPaymentHandler', () => {
  const handler = new MockPaymentHandler();

  it('should return a default payment method on file', async () => {
    const methods = await handler.getPaymentMethods();
    expect(methods.length).toBeGreaterThan(0);
    const defaultMethod = methods.find((m) => m.isDefault);
    expect(defaultMethod).toBeDefined();
    expect(defaultMethod?.lastFour).toHaveLength(4);
  });

  it('should expose card expiry details for display', async () => {
    const methods = await handler.getPaymentMethods();
    const card = methods.find((m) => m.type === 'card');
    expect(card?.expiryMonth).not.toBeNull();
    expect(card?.expiryYear).not.toBeNull();
  });
});
