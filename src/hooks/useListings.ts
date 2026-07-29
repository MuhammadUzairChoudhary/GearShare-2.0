import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_CONFIG } from '../constants/api';
import { getRepositories } from '../repositories';
import type { ListingSearchInput } from '../types/search';

export function useFeaturedListings() {
  return useQuery({
    queryKey: QUERY_KEYS.listings.featured(),
    queryFn: () => getRepositories().listings.getFeaturedListings(),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    retry: QUERY_CONFIG.defaultRetryCount,
  });
}

export function useSearchListings(input: ListingSearchInput) {
  return useQuery({
    queryKey: QUERY_KEYS.listings.search(input as Record<string, unknown>),
    queryFn: () => getRepositories().listings.searchListings(input),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    retry: QUERY_CONFIG.defaultRetryCount,
    enabled: Boolean(input.query || input.activity || input.categoryId),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.listings.detail(id),
    queryFn: () => getRepositories().listings.getListingById(id),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    retry: QUERY_CONFIG.defaultRetryCount,
    enabled: Boolean(id),
  });
}

export function useMapListings(input: ListingSearchInput) {
  return useQuery({
    queryKey: QUERY_KEYS.listings.search({ ...input, map: true } as Record<string, unknown>),
    queryFn: () => getRepositories().listings.getMapListings(input),
    staleTime: QUERY_CONFIG.defaultStaleTime,
    gcTime: QUERY_CONFIG.defaultGcTime,
    enabled: Boolean(input.query || input.activity || input.categoryId),
  });
}
