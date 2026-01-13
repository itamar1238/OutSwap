/**
 * Validation utilities for OutSwap
 * Provides input validation for prices, dates, and user data
 */

import {
  CreateOutfitInput,
  CreateRatingInput,
  CreateRentalInput,
} from "../types";

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Price Validation
export const validatePrice = (
  price: number,
  fieldName: string = "Price"
): ValidationError | null => {
  if (price === undefined || price === null) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  if (typeof price !== "number" || isNaN(price)) {
    return { field: fieldName, message: `${fieldName} must be a valid number` };
  }
  if (price <= 0) {
    return { field: fieldName, message: `${fieldName} must be greater than 0` };
  }
  if (price > 100000) {
    return {
      field: fieldName,
      message: `${fieldName} seems unreasonably high`,
    };
  }
  return null;
};

// Date Validation
export const validateDate = (
  date: Date | string,
  fieldName: string = "Date"
): ValidationError | null => {
  if (!date) {
    return { field: fieldName, message: `${fieldName} is required` };
  }

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return { field: fieldName, message: `${fieldName} is not a valid date` };
  }

  return null;
};

export const validateDateRange = (
  startDate: Date | string,
  endDate: Date | string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const startError = validateDate(startDate, "Start date");
  if (startError) errors.push(startError);

  const endError = validateDate(endDate, "End date");
  if (endError) errors.push(endError);

  if (errors.length > 0) return errors;

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (end <= start) {
    errors.push({
      field: "endDate",
      message: "End date must be after start date",
    });
  }

  return errors;
};

export const validateFutureDate = (
  date: Date | string,
  fieldName: string = "Date"
): ValidationError | null => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;

  const parsedDate = date instanceof Date ? date : new Date(date);
  const now = new Date();

  if (parsedDate < now) {
    return {
      field: fieldName,
      message: `${fieldName} must be in the future`,
    };
  }

  return null;
};

// String Validation
export const validateString = (
  value: string,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 10000
): ValidationError | null => {
  if (!value || typeof value !== "string") {
    return { field: fieldName, message: `${fieldName} is required` };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return null;
};

// Email Validation
export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: "email", message: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: "email", message: "Invalid email format" };
  }

  return null;
};

// Phone Validation
export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone) {
    return { field: "phone", message: "Phone number is required" };
  }

  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { field: "phone", message: "Invalid phone number format" };
  }

  return null;
};

// Array Validation
export const validateArray = (
  arr: any[],
  fieldName: string,
  minLength: number = 1
): ValidationError | null => {
  if (!Array.isArray(arr)) {
    return { field: fieldName, message: `${fieldName} must be an array` };
  }

  if (arr.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must contain at least ${minLength} item(s)`,
    };
  }

  return null;
};

// Rating Validation
export const validateRating = (rating: number): ValidationError | null => {
  if (rating === undefined || rating === null) {
    return { field: "rating", message: "Rating is required" };
  }

  if (typeof rating !== "number" || isNaN(rating)) {
    return { field: "rating", message: "Rating must be a number" };
  }

  if (rating < 1 || rating > 5) {
    return { field: "rating", message: "Rating must be between 1 and 5" };
  }

  return null;
};

// Complex Object Validation
export const validateOutfitInput = (
  input: CreateOutfitInput
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation
  const titleError = validateString(input.title, "Title", 3, 100);
  if (titleError) errors.push(titleError);

  // Description validation
  const descError = validateString(input.description, "Description", 10, 2000);
  if (descError) errors.push(descError);

  // Images validation
  const imagesError = validateArray(input.images, "Images", 1);
  if (imagesError) errors.push(imagesError);

  // Price validation
  const hourlyPriceError = validatePrice(input.pricePerHour, "Price per hour");
  if (hourlyPriceError) errors.push(hourlyPriceError);

  const dailyPriceError = validatePrice(input.pricePerDay, "Price per day");
  if (dailyPriceError) errors.push(dailyPriceError);

  // Validate that daily price is less than 24x hourly (if not, suggest users use daily)
  if (
    input.pricePerDay &&
    input.pricePerHour &&
    input.pricePerDay >= input.pricePerHour * 24
  ) {
    errors.push({
      field: "pricePerDay",
      message: "Daily price should be less than 24× hourly price",
    });
  }

  // Size validation
  if (!input.size) {
    errors.push({ field: "size", message: "Size is required" });
  }

  // Category validation
  if (!input.category) {
    errors.push({ field: "category", message: "Category is required" });
  }

  // Style tags validation
  if (!input.styleTags || input.styleTags.length === 0) {
    errors.push({
      field: "styleTags",
      message: "At least one style tag is required",
    });
  }

  // Location validation
  if (!input.location) {
    errors.push({ field: "location", message: "Location is required" });
  } else {
    if (!input.location.latitude || !input.location.longitude) {
      errors.push({
        field: "location",
        message: "Valid coordinates are required",
      });
    }
  }

  // Availability dates validation
  const availError = validateArray(
    input.availabilityDates,
    "Availability dates",
    1
  );
  if (availError) {
    errors.push(availError);
  } else {
    input.availabilityDates.forEach((range, index) => {
      const rangeErrors = validateDateRange(range.startDate, range.endDate);
      rangeErrors.forEach((err) => {
        errors.push({
          field: `availabilityDates[${index}].${err.field}`,
          message: err.message,
        });
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRentalInput = (
  input: CreateRentalInput
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Outfit ID validation
  if (!input.outfitId) {
    errors.push({ field: "outfitId", message: "Outfit ID is required" });
  }

  // Date range validation
  const dateErrors = validateDateRange(input.startDate, input.endDate);
  errors.push(...dateErrors);

  // Validate future dates
  if (dateErrors.length === 0) {
    const startFutureError = validateFutureDate(input.startDate, "Start date");
    if (startFutureError) errors.push(startFutureError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRatingInput = (
  input: CreateRatingInput
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Target ID validation
  if (!input.targetId) {
    errors.push({ field: "targetId", message: "Target ID is required" });
  }

  // Target type validation
  if (!input.targetType || !["outfit", "user"].includes(input.targetType)) {
    errors.push({
      field: "targetType",
      message: 'Target type must be either "outfit" or "user"',
    });
  }

  // Rating validation
  const ratingError = validateRating(input.rating);
  if (ratingError) errors.push(ratingError);

  // Comment validation (optional, but if provided must be valid)
  if (input.comment) {
    const commentError = validateString(input.comment, "Comment", 1, 500);
    if (commentError) errors.push(commentError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Calculate rental duration and price
export const calculateRentalDuration = (
  startDate: Date,
  endDate: Date
): {
  hours: number;
  days: number;
} => {
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return { hours, days };
};

export const calculateRentalPrice = (
  startDate: Date,
  endDate: Date,
  pricePerHour: number,
  pricePerDay: number
): number => {
  const { hours, days } = calculateRentalDuration(startDate, endDate);

  // Use daily rate if more economical for multi-day rentals
  const hourlyTotal = hours * pricePerHour;
  const dailyTotal = days * pricePerDay;

  return Math.min(hourlyTotal, dailyTotal);
};
