import type { Conversation, Message, SendMessageInput } from '../types/message';
import type { Rental } from '../types/rental';
import { mockMessages, mockRentals } from '../mocks/data';
import { generateId, formatShortDate } from '../utils/format';

/**
 * Builds a short pickup/return context for the conversation subline, e.g.
 * "Pickup Today" or "Return Sep 2". Returns null when the rental is terminal
 * (completed/cancelled) or the date is far out.
 */
function buildContextLabel(rental: Rental): string | null {
  if (rental.status === 'completed' || rental.status === 'cancelled') return null;

  const referenceDate =
    rental.status === 'return_due' || rental.status === 'under_review'
      ? rental.endDate
      : rental.startDate;
  // Note: date-only strings ('2026-08-15') parse as UTC midnight, which can
  // shift a day in negative-offset timezones. Acceptable for mock data.
  const date = new Date(referenceDate);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let dayLabel: string;
  if (diffDays === 0) dayLabel = 'Today';
  else if (diffDays === 1) dayLabel = 'Tomorrow';
  else if (diffDays >= 2 && diffDays <= 6) dayLabel = formatShortDate(referenceDate);
  else return null;

  if (rental.status === 'return_due' || rental.status === 'under_review') {
    return `Return ${dayLabel}`;
  }
  return `Pickup ${dayLabel}`;
}

export interface MessagesRepository {
  getRentalMessages(rentalId: string): Promise<Message[]>;
  /** Conversation threads (per rental) for the Chat tab, newest first. */
  getConversations(userId: string): Promise<Conversation[]>;
  sendMessage(input: SendMessageInput & { senderId: string }): Promise<Message>;
  /** Batch archive — moves conversations out of All/Unread into Archived. */
  archiveConversations(rentalIds: string[]): Promise<void>;
  /** Batch un-archive — restores conversations to All/Unread. */
  unarchiveConversations(rentalIds: string[]): Promise<void>;
  /** Batch delete — removes conversations entirely. */
  deleteConversations(rentalIds: string[]): Promise<void>;
  /** Batch mark-as-unread — flags the latest other-party message as unread. */
  markConversationsUnread(rentalIds: string[], userId: string): Promise<void>;
  /** Batch mark-as-read — clears unread on the latest other-party messages. */
  markConversationsRead(rentalIds: string[], userId: string): Promise<void>;
}

export class MockMessagesRepository implements MessagesRepository {
  private messages: Message[] = [...mockMessages];
  private archivedIds = new Set<string>();
  private deletedIds = new Set<string>();

  async getRentalMessages(rentalId: string): Promise<Message[]> {
    return this.messages
      .filter((m) => m.rentalId === rentalId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations: Conversation[] = [];

    for (const rental of mockRentals) {
      const isRenter = rental.renterId === userId;
      const isOwner = rental.ownerId === userId;
      if (!isRenter && !isOwner) continue;
      // Deleted conversations no longer appear in the Chat tab.
      if (this.deletedIds.has(rental.id)) continue;

      const thread = this.messages
        .filter((m) => m.rentalId === rental.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Only rentals with at least one message appear as conversations.
      if (thread.length === 0) continue;

      const lastMessage = thread[thread.length - 1] ?? null;
      const unreadCount = thread.filter((m) => m.senderId !== userId && m.readAt === null).length;
      // The other party: the owner when you're the renter, the renter when you're the owner.
      const otherParty = isRenter ? rental.owner : rental.renter;
      if (!otherParty) continue;

      conversations.push({
        rentalId: rental.id,
        otherParty,
        listingName: rental.listing?.gearItem?.name ?? 'Rental',
        listingImageUrl: rental.listing?.images?.[0]?.storagePath ?? null,
        status: rental.status,
        contextLabel: buildContextLabel(rental),
        lastMessage,
        unreadCount,
        updatedAt: lastMessage?.createdAt ?? rental.updatedAt,
        archived: this.archivedIds.has(rental.id),
      });
    }

    return conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async sendMessage(input: SendMessageInput & { senderId: string }): Promise<Message> {
    const message: Message = {
      id: `msg-${generateId()}`,
      rentalId: input.rentalId,
      senderId: input.senderId,
      body: input.body,
      messageType: input.messageType ?? 'text',
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(message);
    return message;
  }

  async archiveConversations(rentalIds: string[]): Promise<void> {
    rentalIds.forEach((id) => this.archivedIds.add(id));
  }

  async unarchiveConversations(rentalIds: string[]): Promise<void> {
    rentalIds.forEach((id) => this.archivedIds.delete(id));
  }

  async deleteConversations(rentalIds: string[]): Promise<void> {
    rentalIds.forEach((id) => {
      this.deletedIds.add(id);
      this.archivedIds.delete(id);
    });
  }

  async markConversationsUnread(rentalIds: string[], userId: string): Promise<void> {
    for (const rentalId of rentalIds) {
      const otherPartyLatest = this.messages
        .filter((m) => m.rentalId === rentalId && m.senderId !== userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (otherPartyLatest) otherPartyLatest.readAt = null;
    }
  }

  async markConversationsRead(rentalIds: string[], userId: string): Promise<void> {
    for (const rentalId of rentalIds) {
      this.messages
        .filter((m) => m.rentalId === rentalId && m.senderId !== userId && m.readAt === null)
        .forEach((m) => {
          m.readAt = new Date().toISOString();
        });
    }
  }
}

export class SupabaseMessagesRepository implements MessagesRepository {
  async getRentalMessages(_rentalId: string): Promise<Message[]> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async getConversations(_userId: string): Promise<Conversation[]> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async sendMessage(_input: SendMessageInput & { senderId: string }): Promise<Message> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async archiveConversations(_rentalIds: string[]): Promise<void> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async unarchiveConversations(_rentalIds: string[]): Promise<void> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async deleteConversations(_rentalIds: string[]): Promise<void> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async markConversationsUnread(_rentalIds: string[], _userId: string): Promise<void> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }

  async markConversationsRead(_rentalIds: string[], _userId: string): Promise<void> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }
}
