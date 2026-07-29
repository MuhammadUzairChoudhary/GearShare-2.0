import { isMockDataEnabled, isDevelopment, isProduction } from '../constants/env';

describe('Environment Configuration', () => {
  it('should use mock data by default in test environment', () => {
    // In test env with default setup, mock data should be enabled
    expect(isMockDataEnabled()).toBe(true);
  });

  it('should detect development mode', () => {
    // Default is development
    expect(isDevelopment()).toBe(true);
    expect(isProduction()).toBe(false);
  });

  it('should export expected environment helpers', () => {
    expect(typeof isMockDataEnabled).toBe('function');
    expect(typeof isDevelopment).toBe('function');
    expect(typeof isProduction).toBe('function');
  });
});
