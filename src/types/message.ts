import type { Profile } from './profile';

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
  lastMessage: Message | null;
  /** Messages from the other party that have not been read yet. */
  unreadCount: number;
  updatedAt: string;
}
