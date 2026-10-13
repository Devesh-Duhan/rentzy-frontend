import HomeClient from './HomeClient';
import { siteMetadata } from '@/lib/siteMetadata';

export const generateMetadata = () => siteMetadata();
export default function Home() { return <HomeClient />; }
