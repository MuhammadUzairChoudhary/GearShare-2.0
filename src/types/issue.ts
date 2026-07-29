export type IssueType =
  'damage' | 'not_returned' | 'returned_late' | 'wrong_item' | 'quality' | 'other';
export type IssueStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
export type IssueResolution =
  'refund_renter' | 'charge_renter' | 'partial_refund' | 'no_action' | 'other';

export interface Issue {
  id: string;
  rentalId: string;
  reporterId: string;
  issueType: IssueType;
  description: string;
  status: IssueStatus;
  resolution: IssueResolution | null;
  financialAdjustment: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateIssueInput = Pick<Issue, 'rentalId' | 'issueType' | 'description'>;

export type UpdateIssueInput = Partial<
  Pick<Issue, 'status' | 'resolution' | 'financialAdjustment'>
>;
