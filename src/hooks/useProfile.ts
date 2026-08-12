import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_CONFIG } from '../constants/api';
import { getRepositories } from '../repositories';
import type { ProfileUpdateInput } from '../types/profile';

export function useProfile(userId: string) {
  return useQuery({
    // Per-user key: the public profile page views other members, so the cache
    // must never serve one user's data for another's id.
    queryKey: QUERY_KEYS.profile.byId(userId),
    queryFn: () => getRepositories().profiles.getProfile(userId),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: ProfileUpdateInput }) =>
      getRepositories().profiles.updateProfile(userId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.byId(variables.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.me });
    },
  });
}
