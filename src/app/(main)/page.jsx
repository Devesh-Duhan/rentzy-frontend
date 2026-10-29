import HomeClient from './HomeClient';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata('/');
export default function Home() { return <HomeClient />; }
