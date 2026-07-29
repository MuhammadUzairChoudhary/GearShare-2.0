import type { Listing } from './listing';
import type { Profile } from './profile';

export type RentalStatus =
  | 'request_sent'
  | 'waiting_for_owner'
  | 'action_required'
  | 'confirmed'
  | 'pickup_due'
  | 'active'
  | 'return_due'
  | 'under_review'
  | 'completed'
  | 'cancelled';

export type RentalStatusLabel =
  | 'Request Sent'
  | 'Waiting for Owner'
  | 'Action Required'
  | 'Confirmed'
  | 'Pickup Due'
  | 'Active'
  | 'Return Due'
  | 'Under Review'
  | 'Completed'
  | 'Cancelled';

export const RENTAL_STATUS_LABELS: Record<RentalStatus, RentalStatusLabel> = {
  request_sent: 'Request Sent',
  waiting_for_owner: 'Waiting for Owner',
  action_required: 'Action Required',
  confirmed: 'Confirmed',
  pickup_due: 'Pickup Due',
  active: 'Active',
  return_due: 'Return Due',
  under_review: 'Under Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export type RentalStatusVariant = 'pending' | 'info' | 'warning' | 'success' | 'error' | 'neutral';

export const RENTAL_STATUS_VARIANTS: Record<RentalStatus, RentalStatusVariant> = {
  request_sent: 'pending',
  waiting_for_owner: 'pending',
  action_required: 'warning',
  confirmed: 'info',
  pickup_due: 'info',
  active: 'success',
  return_due: 'warning',
  under_review: 'warning',
  completed: 'success',
  cancelled: 'error',
};

export const RENTAL_STATUS_ORDER: RentalStatus[] = [
  'request_sent',
  'waiting_for_owner',
  'action_required',
  'confirmed',
  'pickup_due',
  'active',
  'return_due',
  'under_review',
  'completed',
  'cancelled',
];

export function getRentalStatusLabel(status: RentalStatus): RentalStatusLabel {
  return RENTAL_STATUS_LABELS[status];
}

export function getRentalStatusVariant(status: RentalStatus): RentalStatusVariant {
  return RENTAL_STATUS_VARIANTS[status];
}

export interface Rental {
  id: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  pickupWindow: string | null;
  returnWindow: string | null;
  intendedUse: string | null;
  rentalCharge: number;
  fees: number;
  depositHold: number;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;

  listing?: Listing;
  renter?: Profile;
  owner?: Profile;
}

export interface CreateRentalRequestInput {
  listingId: string;
  startDate: string;
  endDate: string;
  intendedUse?: string;
  pickupWindow?: string;
  returnWindow?: string;
  renterId: string;
}

export type UpdateRentalInput = Partial<Pick<Rental, 'status' | 'pickupWindow' | 'returnWindow'>>;
