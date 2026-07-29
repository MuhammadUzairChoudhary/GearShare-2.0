import type { Message, SendMessageInput } from '../types/message';
import { mockMessages } from '../mocks/data';
import { generateId } from '../utils/format';

export interface MessagesRepository {
  getRentalMessages(rentalId: string): Promise<Message[]>;
  sendMessage(input: SendMessageInput & { senderId: string }): Promise<Message>;
}

export class MockMessagesRepository implements MessagesRepository {
  private messages: Message[] = [...mockMessages];

  async getRentalMessages(rentalId: string): Promise<Message[]> {
    return this.messages
      .filter((m) => m.rentalId === rentalId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  async sendMessage(_input: SendMessageInput & { senderId: string }): Promise<Message> {
    throw new Error('Not implemented. Connect Supabase when ready.');
  }
}
