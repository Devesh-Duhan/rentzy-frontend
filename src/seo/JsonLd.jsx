import { serializeJsonLd } from './schema';

export default function JsonLd({ id, data }) {
  if (!data) return null;
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}} />;
}
