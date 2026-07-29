export interface ReviewRating {
  overall: number;
  communication: number;
  reliability: number;
  equipmentCondition: number;
}

export interface Review {
  id: string;
  rentalId: string;
  reviewerId: string;
  reviewedUserId: string;
  listingId: string;
  rating: ReviewRating;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateReviewInput = Pick<
  Review,
  'rentalId' | 'reviewedUserId' | 'listingId' | 'rating'
> &
  Partial<Pick<Review, 'feedback'>>;
