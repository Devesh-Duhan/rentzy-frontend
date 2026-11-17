import 'server-only';
import Link from 'next/link';
import { metadataText } from '@/seo';
import { Separator } from '@/components/ui/separator';
import { PAGE_GUIDES } from '@/content/page-guides.mjs';

// Rendered by the route on the server and passed through the existing client shell.
// Only the selected guide is serialized; editorial copy stays out of client bundles.
export default function PageGuide({ page, subject }) {
  const guide = PAGE_GUIDES[page];
  if (!guide) return null;
  const headingId = 'page-guide-' + page;
  const readable = text => text.replace(/\{subject\}/g, () => metadataText(subject) || 'this property');
  return <section data-page-guide={page} aria-labelledby={headingId} className="app-container pb-12 pt-6 sm:pb-16">
    <Separator className="mb-8" />
    <h2 id={headingId} className="mb-6 text-lg font-semibold break-words tracking-tight text-foreground sm:text-2xl">{readable(guide.title)}</h2>
    <div className="grid gap-6 md:grid-cols-3 md:gap-8">
      {guide.sections.map(([title, text]) => <div key={title}>
        <h3 className="mb-2 text-sm font-semibold text-foreground sm:text-base">{readable(title)}</h3>
        <p className="break-words text-sm leading-7 text-muted-foreground">{readable(text)}</p>
      </div>)}
    </div>
    <nav aria-label={readable(guide.title) + ' resources'} className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
      {guide.links.map(([label, href]) => <Link key={href} href={href} prefetch={false} className="font-medium text-indigo-600 underline underline-offset-4 dark:text-indigo-300">{label}</Link>)}
    </nav>
  </section>;
}
