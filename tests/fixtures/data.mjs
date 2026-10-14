export const propertyId = '111111111111111111111111';
const base = {
  price: 18500, purpose: ['rent'], bedrooms: 2, bathrooms: 2, areaSqFt: 1250,
  location: { city: 'Hisar', state: 'Haryana', address: 'Test address' },
  images: ['/images/home-interior.jpg', '/images/owner-interior.jpg'],
  sellerId: { _id: '222222222222222222222222', name: 'Test owner' },
  description: 'A spacious test property with parking and a lift. This listing exists only in automated test fixtures.',
  status: 'available', isPaid: true, isVerified: true, amenities: ['Parking', 'Lift'],
  createdAt: '2026-01-01T00:00:00.000Z',
};
export const properties = ['commercial', 'residential', 'land'].flatMap((type, group) =>
  Array.from({ length: type === 'commercial' ? 19 : 5 }, (_, index) => ({
    ...base, _id: group === 0 && index === 0 ? propertyId : (100 + group * 100 + index).toString(16).padStart(24, '0'),
    title: `${type} property ${index + 1}`, type: [type],
  })),
);
export function propertyResults(params) {
  const page = Math.max(1, Number(params.get('page')) || 1), limit = Number(params.get('limit')) || 10;
  const keyword = (params.get('keyword') || '').toLowerCase();
  const filtered = properties.filter(item => (!params.get('type') || item.type.includes(params.get('type'))) &&
    (!keyword || item.title.toLowerCase().includes(keyword)) &&
    (!params.get('city') || item.location.city.toLowerCase().includes(params.get('city').toLowerCase())));
  return { properties: filtered.slice((page - 1) * limit, page * limit), page, pages: Math.ceil(filtered.length / limit), count: filtered.length };
}
