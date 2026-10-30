import JsonLd from '@/seo/JsonLd';
import { organizationSchema } from '@/seo/schema';
export default function OrganizationSchema() { return <JsonLd id="organization-schema" data={organizationSchema()} />; }
