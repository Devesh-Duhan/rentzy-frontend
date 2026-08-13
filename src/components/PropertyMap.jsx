'use client';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(
  () => import('./MapContent'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" /> }
);

export default function PropertyMap(props) {
  return <MapWithNoSSR {...props} />;
}
