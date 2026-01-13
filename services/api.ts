/**
 * API Service for OutSwap
 * Handles all HTTP requests to the backend API
 */

import {
  ApiResponse,
  CreateOutfitInput,
  CreateRatingInput,
  CreateRentalInput,
  Outfit,
  OutfitSearchParams,
  PaginatedResponse,
  Rating,
  Rental,
  RentalStatus,
  UpdateOutfitInput,
  User,
} from "../types";
import { calculateRentalPrice } from "../utils/validation";

// Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// Helper function for fetch requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "An error occurred",
        message: data.message,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============= OUTFIT API =============

export const OutfitAPI = {
  /**
   * Create a new outfit listing
   */
  async create(input: CreateOutfitInput): Promise<ApiResponse<Outfit>> {
    return apiRequest<Outfit>("/outfits", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Update an existing outfit
   */
  async update(input: UpdateOutfitInput): Promise<ApiResponse<Outfit>> {
    const { id, ...updateData } = input;
    return apiRequest<Outfit>(`/outfits/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete an outfit
   */
  async delete(outfitId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/outfits/${outfitId}`, {
      method: "DELETE",
    });
  },

  /**
   * Get a single outfit by ID
   */
  async getById(outfitId: string): Promise<ApiResponse<Outfit>> {
    return apiRequest<Outfit>(`/outfits/${outfitId}`);
  },

  /**
   * Get all outfits by owner
   */
  async getByOwner(ownerId: string): Promise<ApiResponse<Outfit[]>> {
    return apiRequest<Outfit[]>(`/outfits/owner/${ownerId}`);
  },

  /**
   * Search outfits with filters and sorting
   */
  async search(
    params: OutfitSearchParams
  ): Promise<ApiResponse<PaginatedResponse<Outfit>>> {
    return apiRequest<PaginatedResponse<Outfit>>("/outfits/search", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  /**
   * Get nearby outfits based on user location
   */
  async getNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<ApiResponse<Outfit[]>> {
    return apiRequest<Outfit[]>(
      `/outfits/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
    );
  },
};

// ============= RENTAL API =============

export const RentalAPI = {
  /**
   * Create a rental request
   */
  async createRequest(input: CreateRentalInput): Promise<ApiResponse<Rental>> {
    return apiRequest<Rental>("/rentals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Confirm a rental (by outfit owner)
   */
  async confirm(rentalId: string): Promise<ApiResponse<Rental>> {
    return apiRequest<Rental>(`/rentals/${rentalId}/confirm`, {
      method: "POST",
    });
  },

  /**
   * Mark rental as returned
   */
  async markReturned(rentalId: string): Promise<ApiResponse<Rental>> {
    return apiRequest<Rental>(`/rentals/${rentalId}/return`, {
      method: "POST",
    });
  },

  /**
   * Cancel a rental
   */
  async cancel(
    rentalId: string,
    reason?: string
  ): Promise<ApiResponse<Rental>> {
    return apiRequest<Rental>(`/rentals/${rentalId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Update rental status
   */
  async updateStatus(
    rentalId: string,
    status: RentalStatus
  ): Promise<ApiResponse<Rental>> {
    return apiRequest<Rental>(`/rentals/${rentalId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Get a rental by ID
   */
  async getById(rentalId: string): Promise<ApiResponse<Rental>> {
    return apiRequest<Rental>(`/rentals/${rentalId}`);
  },

  /**
   * Get all rentals for a user (as renter)
   */
  async getByRenter(userId: string): Promise<ApiResponse<Rental[]>> {
    return apiRequest<Rental[]>(`/rentals/renter/${userId}`);
  },

  /**
   * Get all rentals for a user's outfits (as owner)
   */
  async getByOwner(userId: string): Promise<ApiResponse<Rental[]>> {
    return apiRequest<Rental[]>(`/rentals/owner/${userId}`);
  },

  /**
   * Calculate rental price (client-side calculation)
   */
  calculatePrice(
    startDate: Date,
    endDate: Date,
    pricePerHour: number,
    pricePerDay: number
  ): number {
    return calculateRentalPrice(startDate, endDate, pricePerHour, pricePerDay);
  },
};

// ============= USER API =============

export const UserAPI = {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<ApiResponse<User>> {
    return apiRequest<User>(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<ApiResponse<User>> {
    return apiRequest<User>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest<User>("/users/me");
  },
};

// ============= RATING API =============

export const RatingAPI = {
  /**
   * Create a rating
   */
  async create(input: CreateRatingInput): Promise<ApiResponse<Rating>> {
    return apiRequest<Rating>("/ratings", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Get ratings for an outfit
   */
  async getForOutfit(outfitId: string): Promise<ApiResponse<Rating[]>> {
    return apiRequest<Rating[]>(`/ratings/outfit/${outfitId}`);
  },

  /**
   * Get ratings for a user
   */
  async getForUser(userId: string): Promise<ApiResponse<Rating[]>> {
    return apiRequest<Rating[]>(`/ratings/user/${userId}`);
  },

  /**
   * Get ratings by a user (ratings they gave)
   */
  async getByUser(userId: string): Promise<ApiResponse<Rating[]>> {
    return apiRequest<Rating[]>(`/ratings/by-user/${userId}`);
  },

  /**
   * Update a rating
   */
  async update(
    ratingId: string,
    updates: { rating?: number; comment?: string }
  ): Promise<ApiResponse<Rating>> {
    return apiRequest<Rating>(`/ratings/${ratingId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a rating
   */
  async delete(ratingId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/ratings/${ratingId}`, {
      method: "DELETE",
    });
  },
};

// ============= UTILITY FUNCTIONS =============

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Sort outfits by proximity to a location
 */
export function sortByProximity(
  outfits: Outfit[],
  userLat: number,
  userLon: number
): Outfit[] {
  return outfits.sort((a, b) => {
    const distA = calculateDistance(
      userLat,
      userLon,
      a.location.latitude,
      a.location.longitude
    );
    const distB = calculateDistance(
      userLat,
      userLon,
      b.location.latitude,
      b.location.longitude
    );
    return distA - distB;
  });
}

/**
 * Sort outfits by price
 */
export function sortByPrice(
  outfits: Outfit[],
  priceType: "hour" | "day" = "day",
  ascending: boolean = true
): Outfit[] {
  return outfits.sort((a, b) => {
    const priceA = priceType === "hour" ? a.pricePerHour : a.pricePerDay;
    const priceB = priceType === "hour" ? b.pricePerHour : b.pricePerDay;
    return ascending ? priceA - priceB : priceB - priceA;
  });
}

/**
 * Sort outfits by rating
 */
export function sortByRating(outfits: Outfit[]): Outfit[] {
  return outfits.sort((a, b) => b.rating - a.rating);
}
