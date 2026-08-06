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
  /** Last time the user was active — drives "Online" / "Last online · …" in chat. */
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProfileUpdateInput = Partial<
  Pick<Profile, 'fullName' | 'avatarUrl' | 'location' | 'bio'>
>;
