import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { ConversationCard } from '../components/ui/ConversationCard';
import type { Conversation } from '../types/message';

const baseConversation: Conversation = {
  rentalId: 'rental-1',
  otherParty: {
    id: 'user-2',
    fullName: 'Jordan Lee',
    avatarUrl: null,
    location: null,
    bio: null,
    isRenter: true,
    isOwner: false,
    verificationStatus: 'verified',
    ratingAverage: 4.8,
    ratingCount: 12,
    createdAt: '',
    updatedAt: '',
  },
  listingName: 'Black Diamond Camalot C4',
  lastMessage: {
    id: 'msg-1',
    rentalId: 'rental-1',
    senderId: 'user-2',
    body: 'Hi! Is the tent available?',
    messageType: 'text',
    readAt: null,
    createdAt: new Date().toISOString(),
  },
  unreadCount: 0,
  updatedAt: new Date().toISOString(),
};

function renderCard(conversation: Conversation) {
  return render(
    <ThemeProvider>
      <ConversationCard conversation={conversation} />
    </ThemeProvider>,
  );
}

describe('ConversationCard', () => {
  it('should render the other party, listing, and last-message preview', () => {
    const { getByText } = renderCard(baseConversation);
    expect(getByText('Jordan Lee')).toBeTruthy();
    expect(getByText('Black Diamond Camalot C4')).toBeTruthy();
    expect(getByText('Hi! Is the tent available?')).toBeTruthy();
  });

  it('should render the unread badge and cap it at 9+', () => {
    const { getByText } = renderCard({ ...baseConversation, unreadCount: 12 });
    expect(getByText('9+')).toBeTruthy();
  });

  it('should hide the badge when there are no unread messages', () => {
    const { queryByText } = renderCard(baseConversation);
    expect(queryByText('9+')).toBeNull();
    expect(queryByText('1')).toBeNull();
  });

  it('should announce unread state in the accessibility label', () => {
    const { getByLabelText } = renderCard({ ...baseConversation, unreadCount: 3 });
    expect(
      getByLabelText(/3 unread.*Conversation with Jordan Lee about Black Diamond/),
    ).toBeTruthy();
  });
});
