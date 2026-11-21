import 'server-only';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Compass, Lightbulb, ListChecks, Search } from 'lucide-react';
import { metadataText } from '@/seo';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PAGE_GUIDES } from '@/content/page-guides.mjs';
import styles from './PageGuide.module.css';

const accents = [
  { Icon: Search, className: styles.rose },
  { Icon: ListChecks, className: styles.violet },
  { Icon: Lightbulb, className: styles.teal },
];

// Only the selected guide is rendered on the server; no client-side fetching is needed.
export default function PageGuide({ page, subject }) {
  const guide = PAGE_GUIDES[page];
  if (!guide) return null;
  const headingId = 'page-guide-' + page;
  const readable = text => text.replace(/\{subject\}/g, () => metadataText(subject) || 'this property');

  return (
    <section data-page-guide={page} aria-labelledby={headingId} className="app-container pb-12 pt-6 sm:pb-16">
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className="min-w-0">
            <div className={styles.eyebrow}>
              <BookOpen size={16} aria-hidden="true" />
              The RentzyPro guide
            </div>
            <h2 id={headingId} className={styles.title}>{readable(guide.title)}</h2>
          </div>
          <div className={styles.compass} aria-hidden="true"><Compass size={38} strokeWidth={1.5} /></div>
        </header>

        <div className={styles.grid}>
          {guide.sections.map(([title, text], index) => {
            const { Icon, className } = accents[index % accents.length];
            return (
              <article key={title} className={`${styles.card} ${className}`}>
                <div className={styles.cardTop} aria-hidden="true">
                  <span className={styles.icon}><Icon size={22} strokeWidth={1.75} /></span>
                  <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className={styles.cardTitle}>{readable(title)}</h3>
                <p className={styles.copy}>{readable(text)}</p>
              </article>
            );
          })}
        </div>

        <Separator className="mt-6 h-px w-full bg-slate-200/80 dark:bg-slate-700 sm:mt-8" />
        <div className={styles.footer}>
          <span className={styles.footerLabel}>Keep exploring</span>
          <nav aria-label={readable(guide.title) + ' resources'} className={styles.links}>
            {guide.links.map(([label, href], index) => (
              <Link key={href} href={href} prefetch={false}
                className={buttonVariants({
                  variant: index === 0 ? 'default' : 'outline',
                  className: `h-auto min-h-11 max-w-full gap-2 whitespace-normal rounded-full px-5 py-3 text-left text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 ${index === 0 ? 'bg-rose-600 text-white hover:bg-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'}`,
                })}>
                <span className="min-w-0 break-words">{label}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
