export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Ratings arrive from the browser, so check shape and range at runtime.
// The UI uses the same constants to draw its buttons, so the range lives in one place.
export function isValidRating(rating: unknown): rating is number {
  return Number.isInteger(rating) && (rating as number) >= MIN_RATING && (rating as number) <= MAX_RATING;
}
