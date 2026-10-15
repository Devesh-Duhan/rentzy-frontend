import { LOGO_SRC } from '@/lib/constants';

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "rentzypro",
    "description": "Find Rental Properties Direct From Owners - No Brokerage",
    "url": process.env.NEXT_PUBLIC_URL || "https://rentzypro.com",
    "logo": `${(process.env.NEXT_PUBLIC_URL || "https://rentzypro.com").replace(/\/$/, '')}${LOGO_SRC}`,
    "areaServed": { "@type": "Country", "name": "India" },
    "priceRange": "₹5000 - ₹500000",
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
  );
}
