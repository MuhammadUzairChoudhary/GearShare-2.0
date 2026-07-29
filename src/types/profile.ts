export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'suspended';

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
  isRenter: boolean;
  isOwner: boolean;
  verificationStatus: VerificationStatus;
  ratingAverage: number | null;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProfileUpdateInput = Partial<
  Pick<Profile, 'fullName' | 'avatarUrl' | 'location' | 'bio'>
>;
