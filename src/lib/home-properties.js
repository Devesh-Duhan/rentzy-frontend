export const HOME_PREVIEW_LIMIT = 10;
export const HOME_CATEGORIES = [
  { value: 'featured', title: 'Featured properties', featured: true },
  { value: 'commercial', title: 'Commercial properties' },
  { value: 'residential', title: 'Residential properties' },
  { value: 'pg_hostel', title: 'PGs & hostels' },
  { value: 'land', title: 'Land & plots' },
  { value: 'industrial', title: 'Industrial spaces' },
  { value: 'short_term', title: 'Short-term stays' },
];
export const homeQueryKey = category => ['home','category',category.value,HOME_PREVIEW_LIMIT];
export const homeQuery = category => new URLSearchParams({...(category.featured?{featured:'true'}:{type:category.value}),page:'1',limit:String(HOME_PREVIEW_LIMIT)}).toString();
