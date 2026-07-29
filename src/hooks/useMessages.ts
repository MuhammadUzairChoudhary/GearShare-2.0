import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_CONFIG } from '../constants/api';
import { getRepositories } from '../repositories';
import type { SendMessageInput } from '../types/message';

export function useRentalMessages(rentalId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.messages.byRental(rentalId),
    queryFn: () => getRepositories().messages.getRentalMessages(rentalId),
    staleTime: QUERY_CONFIG.defaultStaleTime / 6, // Messages refresh more frequently
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled: Boolean(rentalId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput & { senderId: string }) =>
      getRepositories().messages.sendMessage(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.byRental(data.rentalId),
      });
    },
  });
}
