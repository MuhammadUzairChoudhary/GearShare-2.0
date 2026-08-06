import type { Profile } from './profile';
import type { RentalStatus } from './rental';

export type MessageType = 'text' | 'system' | 'image' | 'status_update';

export interface Message {
  id: string;
  rentalId: string;
  senderId: string;
  body: string;
  messageType: MessageType;
  readAt: string | null;
  createdAt: string;
}

export type SendMessageInput = Pick<Message, 'rentalId' | 'body'> &
  Partial<Pick<Message, 'messageType'>>;

/** A per-rental conversation thread, as shown in the Chat tab. */
export interface Conversation {
  rentalId: string;
  /** The person you're talking to (owner if you're the renter, renter if you're the owner). */
  otherParty: Profile;
  listingName: string;
  /** Primary listing image, shown as the thread thumbnail. */
  listingImageUrl: string | null;
  /** Rental lifecycle state — drives the color-coded status pill. */
  status: RentalStatus;
  /** Short pickup/return context for the subline, e.g. "Pickup Today". */
  contextLabel: string | null;
  lastMessage: Message | null;
  /** Messages from the other party that have not been read yet. */
  unreadCount: number;
  updatedAt: string;
  /** Manually archived by the user — hidden from All/Unread, shown in Archived. */
  archived: boolean;
}
