import type { Conversation, Message, SendMessageInput } from '../types/message';
import { mockMessages, mockRentals } from '../mocks/data';
import { generateId } from '../utils/format';

export interface MessagesRepository {
  getRentalMessages(rentalId: string): Promise<Message[]>;
  /** Conversation threads (per rental) for the Chat tab, newest first. */
  getConversations(userId: string): Promise<Conversation[]>;
  sendMessage(input: SendMessageInput & { senderId: string }): Promise<Message>;
}

export class MockMessagesRepository implements MessagesRepository {
  private messages: Message[] = [...mockMessages];

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
        lastMessage,
        unreadCount,
        updatedAt: lastMessage?.createdAt ?? rental.updatedAt,
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
}
