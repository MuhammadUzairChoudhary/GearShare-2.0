import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_CONFIG } from '../constants/api';
import { getPaymentHandler } from '../services/payments';

export function usePaymentMethods(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.methods,
    queryFn: () => getPaymentHandler().getPaymentMethods(),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled,
  });
}
