import type { Conversation } from '../types/message';

/** Filter tabs under the Chat search field. */
export type ConversationTab = 'all' | 'updates' | 'archived';

/** Pure filter — case-insensitive match on item or person name. */
export function filterConversations(
  conversations: Conversation[],
  query: string,
): Conversation[] {
  const q = query.trim().toLowerCase();
  if (!q) return conversations;
  return conversations.filter(
    (c) =>
      c.listingName.toLowerCase().includes(q) ||
      c.otherParty.fullName.toLowerCase().includes(q),
  );
}

/**
 * Number of manually archived conversations that have new (unread) messages
 * from the other party. Counts conversations, not total messages.
 */
export function countArchivedWithUnread(conversations: Conversation[]): number {
  return conversations.filter((c) => c.archived && c.unreadCount > 0).length;
}

/**
 * Pure tab filter:
 * - updates  → unread conversations with new activity from the other party
 * - archived → conversations the user manually archived (via the selection mode)
 * - all      → everything except manually archived
 */
export function filterConversationsByTab(
  conversations: Conversation[],
  tab: ConversationTab,
): Conversation[] {
  switch (tab) {
    case 'updates':
      return conversations.filter((c) => !c.archived && c.unreadCount > 0);
    case 'archived':
      return conversations.filter((c) => c.archived);
    case 'all':
    default:
      return conversations.filter((c) => !c.archived);
  }
}
