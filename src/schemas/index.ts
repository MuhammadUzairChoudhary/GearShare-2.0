import { z } from 'zod';
import type { GearCategory, GearCondition } from '../types';

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or less'),
  location: z.string().max(200).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be 100 characters or less'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const gearItemSchema = z.object({
  category: z.enum([
    'camping',
    'hiking',
    'climbing',
    'cycling',
    'water_sports',
    'winter_sports',
    'fishing',
    'skiing',
    'snowboarding',
    'kayaking',
    'backpacking',
    'other',
  ] as const satisfies readonly GearCategory[]),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  brand: z.string().max(100).nullable().optional(),
  model: z.string().max(100).nullable().optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be 5000 characters or less'),
  condition: z.enum([
    'new',
    'like_new',
    'good',
    'fair',
    'wear',
  ] as const satisfies readonly GearCondition[]),
  replacementValue: z.number().int().min(1, 'Replacement value is required'),
  includedComponents: z.array(z.string().max(100)).max(20).nullable().optional(),
});

export const listingSchema = z.object({
  gearItemId: z.string().min(1, 'Gear item is required'),
  dailyPrice: z.number().int().min(1, 'Daily price must be at least $0.01'),
  depositAmount: z.number().int().min(0, 'Deposit cannot be negative'),
  pickupArea: z.string().max(500).nullable().optional(),
  minRentalDuration: z.number().int().min(1).default(1),
  policies: z.array(z.string().max(500)).max(10).nullable().optional(),
});

export const rentalRequestSchema = z.object({
  listingId: z.string().min(1),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  intendedUse: z.string().max(2000).nullable().optional(),
});

export const messageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(5000),
  messageType: z.enum(['text', 'system', 'image', 'status_update']).default('text'),
});

export const reviewSchema = z.object({
  rating: z.object({
    overall: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
    reliability: z.number().int().min(1).max(5),
    equipmentCondition: z.number().int().min(1).max(5),
  }),
  feedback: z.string().max(2000).nullable().optional(),
});

export const issueSchema = z.object({
  issueType: z.enum(['damage', 'not_returned', 'returned_late', 'wrong_item', 'quality', 'other']),
  description: z.string().min(10, 'Please provide a detailed description').max(5000),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type GearItemFormData = z.infer<typeof gearItemSchema>;
export type ListingFormData = z.infer<typeof listingSchema>;
export type RentalRequestFormData = z.infer<typeof rentalRequestSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type IssueFormData = z.infer<typeof issueSchema>;
