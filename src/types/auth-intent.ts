export type PendingAuthIntent =
  | {
      type: 'save-listing';
      listingId: string;
    }
  | {
      type: 'message-owner';
      listingId: string;
      ownerId: string;
    }
  | {
      type: 'request-rental';
      listingId: string;
      draftId?: string;
    };
