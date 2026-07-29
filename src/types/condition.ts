export type ConditionRecordType = 'pickup' | 'return';
export type ConditionConfirmationStatus =
  'pending' | 'confirmed_by_renter' | 'confirmed_by_owner' | 'disputed';

export interface ConditionRecord {
  id: string;
  rentalId: string;
  recordType: ConditionRecordType;
  submittedBy: string;
  notes: string | null;
  confirmationStatus: ConditionConfirmationStatus;
  createdAt: string;
  images?: ConditionImage[];
}

export interface ConditionImage {
  id: string;
  conditionRecordId: string;
  storagePath: string;
  sortOrder: number;
  createdAt: string;
}

export type CreateConditionRecordInput = Pick<ConditionRecord, 'rentalId' | 'recordType' | 'notes'>;
