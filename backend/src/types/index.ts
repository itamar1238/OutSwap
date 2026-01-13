import { ObjectId } from "mongodb";

// Matches frontend types but with MongoDB ObjectId
export interface Location {
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: [number, number]; // [longitude, latitude] for MongoDB geospatial
}

export interface User {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location: Location;
  rating: number;
  totalRatings: number;
  createdAt: Date;
}

export interface Outfit {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  images: string[];
  size: ClothingSize;
  category: OutfitCategory;
  styleTags: string[];
  pricePerHour: number;
  pricePerDay: number;
  ownerId: ObjectId | string;
  owner?: User;
  location: Location;
  available: boolean;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rental {
  _id?: ObjectId;
  id?: string;
  outfitId: ObjectId | string;
  outfit?: Outfit;
  renterId: ObjectId | string;
  renter?: User;
  ownerId: ObjectId | string;
  owner?: User;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: RentalStatus;
  notes?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  _id?: ObjectId;
  id?: string;
  rating: number;
  comment?: string;
  outfitId?: ObjectId | string;
  outfit?: Outfit;
  toUserId?: ObjectId | string;
  toUser?: User;
  fromUserId: ObjectId | string;
  fromUser?: User;
  rentalId?: ObjectId | string;
  createdAt: Date;
}

export enum OutfitCategory {
  FORMAL = "formal",
  CASUAL = "casual",
  SPORTSWEAR = "sportswear",
  PARTY = "party",
  BUSINESS = "business",
  WEDDING = "wedding",
}

export enum ClothingSize {
  XXS = "XXS",
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
}

export enum RentalStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  ACTIVE = "active",
  RETURNED = "returned",
  CANCELLED = "cancelled",
  DISPUTED = "disputed",
}

export type SortOption =
  | "proximity"
  | "price-low"
  | "price-high"
  | "rating-high"
  | "newest";

export interface OutfitSearchParams {
  query?: string;
  category?: OutfitCategory;
  size?: ClothingSize;
  minPrice?: number;
  maxPrice?: number;
  location?: Location;
  radius?: number; // in meters
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}
