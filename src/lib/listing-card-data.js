// Fields consumed by public listing cards, collection schemas and approval checks.
// Full descriptions/owner objects belong on property detail pages, not every list's HTML.
const CARD_FIELDS = [
  '_id', 'id', 'title', 'type', 'purpose', 'price', 'location',
  'images', 'image', 'bedrooms', 'bhk', 'bathrooms', 'areaSqFt', 'area',
  'furnishing', 'postedBy', 'pricePerSqft', 'createdAt', 'isNew', 'isSaved',
  'featured', 'status', 'isVerified', 'isPaid', 'rejectionReason',
];

export function listingCardData(property) {
  return Object.fromEntries(CARD_FIELDS
    .filter(key => property[key] !== undefined)
    .map(key => [key, property[key]]));
}
