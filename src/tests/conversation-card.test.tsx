import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { themeColors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';
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
    lastActiveAt: null,
    createdAt: '',
    updatedAt: '',
  },
  listingName: 'Black Diamond Camalot C4',
  listingImageUrl: null,
  status: 'confirmed',
  contextLabel: 'Pickup Tomorrow',
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
  archived: false,
};

function renderCard(conversation: Conversation) {
  // onPress mirrors production usage: without it Card renders a plain View and
  // drops the accessibility label entirely.
  return render(
    <ThemeProvider>
      <ConversationCard conversation={conversation} onPress={jest.fn()} />
    </ThemeProvider>,
  );
}

describe('ConversationCard', () => {
  it('should render the owner, gear, context, and last-message preview', () => {
    const { getByText } = renderCard(baseConversation);
    // Gear name shares its line with the context: "Black Diamond Camalot C4 · Pickup Tomorrow".
    expect(getByText(/Black Diamond Camalot C4/)).toBeTruthy();
    expect(getByText(/Jordan Lee/)).toBeTruthy();
    expect(getByText(/Pickup Tomorrow/)).toBeTruthy();
    expect(getByText('Hi! Is the tent available?')).toBeTruthy();
  });

  it('should render the relative timestamp of the last message', () => {
    // lastMessage.createdAt is "now", so the relative label is "Just now".
    const { getByText } = renderCard(baseConversation);
    expect(getByText('Just now')).toBeTruthy();
  });

  it('should render the unread badge and cap it at 9+', () => {
    const { getByText } = renderCard({ ...baseConversation, unreadCount: 12 });
    expect(getByText('9+')).toBeTruthy();
  });

  it('should style the preview and timestamp bolder in theme black when unread', () => {
    const { getByText } = renderCard({ ...baseConversation, unreadCount: 3 });
    const preview = getByText('Hi! Is the tent available?');
    const timestamp = getByText('Just now');
    // Heavier weight + theme black (textPrimary), distinct from the muted
    // secondary treatment used for read threads.
    expect(preview.props.style).toEqual(
      expect.objectContaining({
        color: themeColors.light.textPrimary,
        fontFamily: fontFamilies.inter.semiBold,
      }),
    );
    expect(timestamp.props.style).toEqual(
      expect.objectContaining({
        color: themeColors.light.textPrimary,
        fontFamily: fontFamilies.ibmPlexMono.semiBold,
      }),
    );
  });

  it('should keep the preview and timestamp muted when read', () => {
    const { getByText } = renderCard(baseConversation);
    const preview = getByText('Hi! Is the tent available?');
    const timestamp = getByText('Just now');
    expect(preview.props.style).toEqual(
      expect.objectContaining({
        color: themeColors.light.textSecondary,
        fontFamily: fontFamilies.inter.regular,
      }),
    );
    expect(timestamp.props.style).toEqual(
      expect.objectContaining({
        color: themeColors.light.textSecondary,
        fontFamily: fontFamilies.ibmPlexMono.regular,
      }),
    );
  });

  it('should hide the badge when there are no unread messages', () => {
    const { queryByText } = renderCard(baseConversation);
    expect(queryByText('9+')).toBeNull();
    expect(queryByText('1')).toBeNull();
  });

  it('should announce unread state in the accessibility label', () => {
    const { getByLabelText } = renderCard({ ...baseConversation, unreadCount: 3 });
    expect(
      getByLabelText(/3 unread messages.*Conversation with Jordan Lee about Black Diamond/),
    ).toBeTruthy();
  });

  it('should fire onLongPress to enter selection mode', () => {
    const onLongPress = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <ConversationCard
          conversation={baseConversation}
          onPress={jest.fn()}
          onLongPress={onLongPress}
        />
      </ThemeProvider>,
    );
    fireEvent(getByLabelText(/Conversation with Jordan Lee/), 'longPress');
    expect(onLongPress).toHaveBeenCalled();
  });

  it('should show a filled tick circle for selected cards in selection mode', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <ConversationCard
          conversation={baseConversation}
          onPress={jest.fn()}
          selectionMode
          selected
        />
      </ThemeProvider>,
    );
    expect(getByLabelText('Selected')).toBeTruthy();
  });

  it('should show an empty circle for non-selected cards in selection mode', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <ConversationCard conversation={baseConversation} onPress={jest.fn()} selectionMode />
      </ThemeProvider>,
    );
    expect(getByLabelText('Not selected')).toBeTruthy();
  });
});
