/**
 * OutSwap - TypeScript Type Definitions
 * Core types for the peer-to-peer outfit rental application
 */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: Location;
  profileImage?: string;
  rating: number;
  totalRatings: number;
  joinedDate: Date;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Outfit Types
export type OutfitCategory =
  | "formal"
  | "casual"
  | "sportswear"
  | "party"
  | "business"
  | "wedding"
  | "seasonal"
  | "other";

export type ClothingSize =
  | "XXS"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL";

export interface Outfit {
  id: string;
  ownerId: string;
  owner?: User;
  title: string;
  description: string;
  images: string[];
  size: ClothingSize;
  category: OutfitCategory;
  styleTags: string[];
  pricePerHour: number;
  pricePerDay: number;
  location: Location;
  availabilityDates: DateRange[];
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Rental Types
export type RentalStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "returned"
  | "cancelled"
  | "disputed";

export interface Rental {
  id: string;
  renterId: string;
  renter?: User;
  outfitId: string;
  outfit?: Outfit;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: RentalStatus;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  returnedAt?: Date;
  notes?: string;
}

// Rating Types
export type RatingType = "outfit" | "user";

export interface Rating {
  id: string;
  fromUserId: string;
  fromUser?: User;
  targetId: string; // outfit or user ID
  targetType: RatingType;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
}

// Search and Filter Types
export interface OutfitSearchFilters {
  location?: Location;
  radiusKm?: number;
  category?: OutfitCategory;
  size?: ClothingSize;
  styleTags?: string[];
  minPrice?: number;
  maxPrice?: number;
  priceType?: "hour" | "day";
  startDate?: Date;
  endDate?: Date;
  minRating?: number;
}

export type SortOption =
  | "proximity"
  | "price-low"
  | "price-high"
  | "rating-high"
  | "newest";

export interface OutfitSearchParams extends OutfitSearchFilters {
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface CreateOutfitInput {
  title: string;
  description: string;
  images: string[];
  size: ClothingSize;
  category: OutfitCategory;
  styleTags: string[];
  pricePerHour: number;
  pricePerDay: number;
  location: Location;
  availabilityDates: DateRange[];
}

export interface UpdateOutfitInput extends Partial<CreateOutfitInput> {
  id: string;
}

export interface CreateRentalInput {
  outfitId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface CreateRatingInput {
  targetId: string;
  targetType: RatingType;
  rating: number;
  comment?: string;
}
