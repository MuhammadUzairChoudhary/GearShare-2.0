import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_CONFIG } from '../constants/api';
import { getRepositories } from '../repositories';
import type { CreateRentalRequestInput, UpdateRentalInput } from '../types/rental';

export function useUserRentals(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rentals.asRenter(userId),
    queryFn: () => getRepositories().rentals.getUserRentals(userId),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled: Boolean(userId),
  });
}

export function useRental(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rentals.detail(id),
    queryFn: () => getRepositories().rentals.getRentalById(id),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled: Boolean(id),
  });
}

export function useCreateRentalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRentalRequestInput) =>
      getRepositories().rentals.createRentalRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rentals.all });
    },
  });
}

export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRentalInput }) =>
      getRepositories().rentals.updateRental(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rentals.all });
    },
  });
}
