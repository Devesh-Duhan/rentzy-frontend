import { cache } from 'react';
import api from './axios';

const readSettings = cache(async () => {
  try {
    const response = await fetch(`${api.defaults.baseURL.replace(/\/$/, '')}/settings`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) });
    return response.ok ? await response.json() : {};
  } catch { return {}; }
});

export async function siteMetadata({ title = 'RentzyPro | Find your next home', description = 'Explore rental homes and properties. Connect directly with owners on RentzyPro.' } = {}) {
  const settings = await readSettings();
  const metadataTitle = settings.metaTitle || title;
  const metadataDescription = settings.metaDescription || description;
  return {
    title: metadataTitle,
    description: metadataDescription,
    keywords: settings.metaKeywords || undefined,
    openGraph: { title: metadataTitle, description: metadataDescription, images: settings.ogImage ? [{ url: settings.ogImage }] : [] },
    twitter: { card: settings.ogImage ? 'summary_large_image' : 'summary', creator: settings.twitterHandle || undefined },
  };
}
