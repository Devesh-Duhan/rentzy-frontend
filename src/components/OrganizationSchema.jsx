import { SITE_SEO } from '@/seo';

export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: SITE_SEO.name, description: SITE_SEO.description, url: SITE_SEO.baseUrl,
    logo: new URL(SITE_SEO.image, SITE_SEO.baseUrl).href,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />;
}
