// TypeScript Engineering Contracts for Smart Sense Hotel Bar (CO2)

export type MiniBarItemStatus = 'on-shelf' | 'picked-up' | 'consumed';

export interface MiniBarItem {
  id: string;
  name: string;
  category: 'Alcoholic' | 'Soft Drink' | 'Snack' | 'Amenity';
  price: number;
  weightFull: number;      // Grams when full
  weightCurrent: number;   // Grams currently sensed
  weightThreshold: number; // Grams below which item is missing
  status: MiniBarItemStatus;
  lastUpdated: string;
  image?: string;
}

export type SensorEventType = 'picked-up' | 'replaced' | 'charge-pending' | 'charged' | 'restocked';

export interface SensorLogEntry {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  eventType: SensorEventType;
  detail: string;
}

export interface DrinkIngredient {
  id: string;
  name: string;
  category: 'spirit' | 'mixer' | 'garnish';
  abv: number; // Alcohol By Volume percentage
  cost: number;
}

export interface DrinkOrder {
  id: string;
  name: string;
  ingredients: DrinkIngredient[];
  totalCost: number;
  abv: number;
  timestamp: string;
  status: 'pending' | 'mixing' | 'served' | 'cancelled';
  notes?: string;
}

export interface FolioCharge {
  id: string;
  desc: string;
  amount: number;
  timestamp: string;
  category: 'mini-bar' | 'bar-room-service' | 'room-charge' | 'self-report';
}

export type GuestLoyaltyTier = 'Silver' | 'Gold' | 'Platinum';

export interface GuestSession {
  roomNumber: string;
  guestName: string;
  loyaltyTier: GuestLoyaltyTier;
  checkInDate: string;
  folioCharges: FolioCharge[];
}

// Generic API Response type to showcase TypeScript Generics (CO2)
export interface APIResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/* --- NEW MODULE TYPES --- */

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
}

export interface ReplenishmentTask {
  id: string;
  itemName: string;
  scheduledTime: string;
  staffName: string;
  status: 'scheduled' | 'completed';
}

export interface CheckedOutSession {
  id: string;
  guestName: string;
  roomNumber: string;
  loyaltyTier: GuestLoyaltyTier;
  totalSettled: number;
  checkoutDate: string;
  charges: FolioCharge[];
}
