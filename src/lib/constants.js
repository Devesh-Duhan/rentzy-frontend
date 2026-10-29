import brandLogo from '../../public/images/logo.png';
import { SITE_SEO } from '../seo/seo.constants.js';

export const BASE_URL = process.env.NEXT_PUBLIC_URL || (process.env.NODE_ENV === 'production' ? 'https://rentzypro.com' : 'http://localhost:3000');
export const APP_NAME = 'rentzypro';
// Content-hashed URLs refresh browser, image-optimizer and PWA caches when the logo changes.
export const LOGO_SRC = brandLogo.src;
export const LOGO_SIZE = `${brandLogo.width}x${brandLogo.height}`;
export const APP_DESCRIPTION = SITE_SEO.description;
export const APP_KEYWORDS = SITE_SEO.keywords.join(', ');
