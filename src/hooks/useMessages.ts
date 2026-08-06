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

export function useConversations(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.messages.conversations(userId),
    queryFn: () => getRepositories().messages.getConversations(userId),
    staleTime: QUERY_CONFIG.defaultStaleTime / 6, // Threads refresh more frequently
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled: Boolean(userId),
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
      // Keep the Chat tab thread list in sync after a send (prefix match).
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.conversationsAll,
      });
    },
  });
}

export type ConversationAction = 'archive' | 'unarchive' | 'delete' | 'unread' | 'read';

export function useConversationActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      action,
      rentalIds,
      userId,
    }: {
      action: ConversationAction;
      rentalIds: string[];
      userId: string;
    }) => {
      const repo = getRepositories().messages;
      if (action === 'archive') return repo.archiveConversations(rentalIds);
      if (action === 'unarchive') return repo.unarchiveConversations(rentalIds);
      if (action === 'delete') return repo.deleteConversations(rentalIds);
      if (action === 'read') return repo.markConversationsRead(rentalIds, userId);
      return repo.markConversationsUnread(rentalIds, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages.conversationsAll });
    },
  });
}
