'use client';
export default function PropertySchema({ property }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.title,
    "description": property.description,
    "image": property.images?.[0],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR",
      "availability": property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
    "category": Array.isArray(property.type) ? property.type[0] : property.type,
    "areaServed": {
      "@type": "City",
      "name": property.location?.city,
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.location?.address,
      "addressLocality": property.location?.city,
      "addressRegion": property.location?.state,
      "postalCode": property.location?.zipcode,
      "addressCountry": property.location?.country || "IN",
    },
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
