import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { metadataText } from '@/seo';

export default function Breadcrumbs({ items, className = 'mb-7' }) {
  return <nav aria-label="Breadcrumb" className={`${className} flex flex-wrap items-center gap-2 text-xs text-slate-500`}>
    {items.map((item,index)=><span key={item.path} className="inline-flex min-w-0 items-center gap-2">
      {index>0&&<ChevronRight size={12} aria-hidden="true" />}
      {index===items.length-1?<span aria-current="page" className="max-w-[220px] truncate text-slate-800 dark:text-slate-300">{metadataText(item.name)}</span>:<Link href={item.path} className="hover:text-indigo-600">{metadataText(item.name)}</Link>}
    </span>)}
  </nav>;
}
