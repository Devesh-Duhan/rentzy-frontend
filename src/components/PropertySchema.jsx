import JsonLd from '@/seo/JsonLd';
import { propertySchema } from '@/seo/schema';
export default function PropertySchema({property}) { return <JsonLd id="property-schema" data={propertySchema(property)} />; }
