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
