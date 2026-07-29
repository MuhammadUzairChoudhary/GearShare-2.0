export type GearCategory =
  | 'camping'
  | 'hiking'
  | 'climbing'
  | 'cycling'
  | 'water_sports'
  | 'winter_sports'
  | 'fishing'
  | 'skiing'
  | 'snowboarding'
  | 'kayaking'
  | 'backpacking'
  | 'other';

export type GearCondition = 'new' | 'like_new' | 'good' | 'fair' | 'wear';

export type GearStatus = 'available' | 'listed' | 'rented' | 'maintenance' | 'retired';

export interface GearItem {
  id: string;
  ownerId: string;
  category: GearCategory;
  name: string;
  brand: string | null;
  model: string | null;
  description: string;
  specifications: Record<string, string> | null;
  condition: GearCondition;
  replacementValue: number;
  includedComponents: string[] | null;
  status: GearStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type GearItemCreateInput = Pick<
  GearItem,
  'category' | 'name' | 'description' | 'condition' | 'replacementValue'
> &
  Partial<Pick<GearItem, 'brand' | 'model' | 'specifications' | 'includedComponents'>>;

export type GearItemUpdateInput = Partial<
  Pick<
    GearItem,
    | 'category'
    | 'name'
    | 'brand'
    | 'model'
    | 'description'
    | 'specifications'
    | 'condition'
    | 'replacementValue'
    | 'includedComponents'
    | 'status'
  >
>;
