import { BRAND_ASSETS } from '../lib/brand.js';

// Edit site identity, page copy and crawl policies here. Never use preview/local URLs for SEO.
export const SITE_SEO = {
  name: 'RentzyPro',
  baseUrl: 'https://rentzypro.com',
  title: 'RentzyPro | Rental Homes & Properties',
  description: 'Explore rental homes and properties on RentzyPro. Browse listings, compare details and connect with property owners.',
  image: BRAND_ASSETS.socialImage,
  imageAlt: 'RentzyPro',
  locale: 'en_IN',
  type: 'website',
  twitterCard: 'summary_large_image',
  keywords: ['RentzyPro', 'rental homes', 'properties', 'landlords', 'tenants'],
  robots: { index: true, follow: true },
};

const page = (canonical, title, description, options = {}) => ({ canonical, title, description, ...options });
const privatePage = (canonical, title, description) => page(canonical, title, description, {
  robots: { index: false, follow: false }, sitemap: false,
});

export const PAGE_SEO = {
  '/': page('/', 'RentzyPro | Rental Homes & Properties', 'Find rental homes and properties on RentzyPro. Explore listings in Hisar, review property details and contact owners.'),
  '/properties': page('/properties', 'Browse Properties', 'Browse RentzyPro property listings. Filter by location, property type and budget to find a place that suits your needs.'),
  '/rent': page('/rent', 'Homes & Properties for Rent', 'Explore properties for rent on RentzyPro. Compare rental homes, review listing details and get in touch with landlords.'),
  '/buy': page('/buy', 'Properties for Sale', 'Browse properties for sale on RentzyPro. Compare locations, prices and property details before contacting the owner.'),
  '/sell': page('/sell', 'List Your Property', 'Learn how to list your property on RentzyPro and share its details with people searching for a home or rental property.'),
  '/about': page('/about', 'About RentzyPro', 'Learn about RentzyPro and how the website helps property owners and people looking for rental homes connect.'),
  '/contact': page('/contact', 'Contact RentzyPro', 'Contact RentzyPro for help with property listings, account questions or using the website. Find available contact options here.'),
  '/blog': page('/blog', 'Property & Rental Blog', 'Read RentzyPro articles about rental homes, property searches and information for tenants and landlords.'),
  '/help': page('/help', 'Help & How It Works', 'Get step-by-step help with searching properties, creating an account, contacting owners and managing listings on RentzyPro.'),
  '/privacy': page('/privacy', 'Privacy Policy', 'Read the RentzyPro privacy policy to understand how information is collected, used and handled when you use the website.'),
  '/terms': page('/terms', 'Terms & Conditions', 'Review the terms and conditions for using RentzyPro, including accounts, property listings and website services.'),
  '/refund-policy': page('/refund-policy', 'Refund Policy', 'Read the RentzyPro refund policy for information about payment terms, cancellations and applicable refund requests.'),
  '/safety': page('/safety', 'Property Search Safety', 'Read safety guidance for searching properties, contacting owners and reviewing listing information on RentzyPro.'),
  '/featured-properties': page('/featured-properties', 'Featured Properties', 'Explore featured property listings on RentzyPro and review locations, prices and listing details.'),
  '/projects': page('/projects', 'Property Projects', 'Explore the property projects page on RentzyPro and review available project information and property details.'),
  '/gallery': page('/gallery', 'Property Gallery', 'Explore property photos in the RentzyPro gallery and take a closer look at spaces before reviewing their listings.'),
  '/rera': page('/rera', 'RERA Information', 'Read RERA information on RentzyPro to help you understand real estate registration and property-related checks.'),
  '/tenant-screening': page('/tenant-screening', 'Tenant Screening Information', 'Explore tenant screening information on RentzyPro and learn about checks landlords can consider when reviewing rental applications.'),
  '/mobile-app': page('/mobile-app', 'Mobile App', 'Find information about the RentzyPro mobile app and the available ways to browse properties on your mobile device.'),
  '/testimonials': page('/testimonials', 'Community Testimonials', 'Read testimonials shared on RentzyPro about using the website to search for properties and connect with owners.'),
  '/refer': page('/refer', 'Refer RentzyPro', 'Find out how to share RentzyPro with someone searching for a property or looking to list a rental home.'),
  '/whatsapp': page('/whatsapp', 'WhatsApp Contact', 'Find the WhatsApp contact options on RentzyPro for property enquiries and questions about using the website.'),
  '/login': page('/login', 'Sign In', 'Sign in to your RentzyPro account to manage saved properties, contact owners and access your account features.'),
  '/register': page('/register', 'Create an Account', 'Create a RentzyPro account to explore rental homes, save properties and connect with landlords and property owners.'),
  '/search': page('/search', 'Search Properties', 'Search RentzyPro listings by location, property type and budget to find relevant homes and properties.', { robots: { index: false, follow: true }, sitemap: false }),
  '/compare': page('/compare', 'Compare Properties', 'Compare selected RentzyPro properties side by side to review prices, locations and listing details.', { robots: { index: false, follow: true }, sitemap: false }),
  '/profile': privatePage('/profile', 'My Profile', 'Manage your RentzyPro profile and account details.'),
  '/chat': privatePage('/chat', 'Messages', 'View your RentzyPro account conversations.'),
  '/wishlist': privatePage('/wishlist', 'Saved Properties', 'Manage the properties saved to your RentzyPro account.'),
  '/alerts': privatePage('/alerts', 'My Alerts', 'Manage your personal RentzyPro property alerts.'),
  '/notifications/preferences': privatePage('/notifications/preferences', 'Notification Preferences', 'Manage notification preferences for your RentzyPro account.'),
  '/become-seller': privatePage('/become-seller', 'Seller Account Setup', 'Set up your RentzyPro seller account details.'),
  '/forgot-password': privatePage('/forgot-password', 'Forgot Password', 'Request password recovery for your RentzyPro account.'),
  '/reset-password': privatePage('/reset-password', 'Reset Password', 'Securely reset your RentzyPro account password.'),
  '/verify-otp': privatePage('/verify-otp', 'Verify Your Account', 'Verify your RentzyPro account using your verification code.'),
  '/offline': privatePage('/offline', 'You Are Offline', 'Reconnect to the internet to continue using RentzyPro.'),
};

export const DASHBOARD_SEO = {
  title: 'Account Dashboard', description: 'Manage your RentzyPro account.',
  robots: { index: false, follow: false },
};

// Fallbacks keep existing dynamic routes correct without inventing listing or article content.
export const DYNAMIC_SEO = {
  property: { title: 'Property Details', description: 'Explore property details and connect with the owner on RentzyPro.' },
  blog: { title: 'Property & Rental Article', description: 'Read property and rental information on the RentzyPro blog.', type: 'article' },
  category: { title: 'Properties by Category', description: 'Explore RentzyPro property listings in this category.' },
  featured: { title: 'Featured Properties', description: 'Browse featured RentzyPro property listings and review their details.' },
};

// Let crawlers read page-level noindex directives; authentication remains the security boundary.
export const CRAWL_SEO = { disallow: ['/api/'], sitemapPath: '/sitemap.xml' };

// Editable dynamic metadata templates and conservative crawl policy.
export const PROPERTY_SEO = {
  title: '{home}{purpose}{location}',
  description: '{summary}. {facts}. {title}. {description}',
  summary: 'Explore {home}{purpose}{location} on RentzyPro',
  locationTitle: '{inventory} in {city}',
  locationDescription: 'Browse {count} available {inventory} in {city} on RentzyPro. Review real listing details, photos and owner contact options.',
  listingDescription: 'Browse {count} available {inventory} on RentzyPro. Compare real listing details and photos before contacting owners.',
  inventory: { rent: 'properties for rent', sell: 'properties for sale', all: 'properties' },
  singularInventory: { rent: 'property for rent', sell: 'property for sale', all: 'property' },
  purpose: { rent: ' for Rent', sell: ' for Sale', both: ' for Rent or Sale' },
  unavailable: { title: 'Property Unavailable', description: 'This property is not publicly available. Browse other property listings on RentzyPro.', robots: { index: false, follow: true } },
  failure: { title: 'Property Temporarily Unavailable', description: 'Property information could not be loaded. Please try again later.', robots: { index: false, follow: true } },
  bedroom: '{count} BHK',
  price: 'Listed price ₹{price}',
  titleLimit: 95, descriptionLimit: 220,
  typeLabels: { residential: 'Property', commercial: 'Commercial Property', apartment: 'Apartment', house: 'House', villa: 'Villa', flat: 'Flat', room: 'Room', 'independent-rooms': 'Independent Room', shop: 'Shop', office: 'Office', land: 'Land', pg_hostel: 'PG/Hostel', 'pg-hostel': 'PG/Hostel', building: 'Building', godown: 'Godown', industrial: 'Industrial Property', short_term: 'Short-term Property' },
  dwellingTypes: ['residential', 'apartment', 'house', 'villa', 'flat', 'room', 'independent-rooms'],
  furnishing: { furnished: 'Furnished', 'semi-furnished': 'Semi-furnished', unfurnished: 'Unfurnished' },
  fetchTimeout: 8000,
  // Only exact city + optional rent/sell, with verified inventory, is a location landing page.
  locationKeys: ['city', 'purpose'],
  trackingKeys: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'],
};

export const SEARCH_FILTER_KEYS = ['q', 'type', 'purpose', 'city', 'minPrice', 'maxPrice', 'bedrooms', 'bathrooms', 'furnishing', 'possession', 'facing', 'postedBy', 'minArea', 'maxArea'];
