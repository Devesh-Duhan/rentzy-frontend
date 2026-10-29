import { pageMetadata } from '@/seo';
import PreferencesClient from "./PreferencesClient";

export const metadata = pageMetadata('/notifications/preferences');

export default function NotificationPreferencesPage() {
  return <PreferencesClient />;
}
