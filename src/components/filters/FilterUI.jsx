"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Building2, MapPin, IndianRupee, BedDouble, Bath, ArrowDownUp, SlidersHorizontal, X, Sofa, UserRound, Compass, CalendarDays, Maximize } from 'lucide-react';
import styles from './Filters.module.css';

const fields = {
  Keyword: [Search, 'typeIcon'], 'Property Type': [Building2, 'typeIcon'], 'Property type': [Building2, 'typeIcon'],
  City: [MapPin, 'cityIcon'], Where: [MapPin, 'cityIcon'], Purpose: [Building2, 'typeIcon'],
  'Min Price': [IndianRupee, 'priceIcon'], 'Max Price': [IndianRupee, 'priceIcon'], 'Price Range': [IndianRupee, 'priceIcon'], Budget: [IndianRupee, 'priceIcon'],
  Bedrooms: [BedDouble, 'bhkIcon'], Bathrooms: [Bath, 'bedroomIcon'], 'Sort By': [ArrowDownUp, 'typeIcon'],
  Furnishing: [Sofa, 'bhkIcon'], 'Posted By': [UserRound, 'cityIcon'], Facing: [Compass, 'typeIcon'], Possession: [CalendarDays, 'bedroomIcon'], 'Area Range (sqft)': [Maximize, 'priceIcon'],
};

export function FilterLabel({ children, ...props }) {
  const [Icon, tone] = fields[children] || [SlidersHorizontal, 'typeIcon'];
  return <label {...props} className={styles.filterLabel}><span className={`${styles.groupIcon} ${styles[tone]}`}><Icon size={15} aria-hidden="true" /></span>{children}</label>;
}

export function FilterPanel({ children, footer, onClose, title = 'Filters', bodyClassName = '' }) {
  return <div className={`${styles.filterPanel} ${styles.panelLayout}`}>
    <div className={styles.panelHeader}>
      <div className={styles.panelHeading}><span className={styles.panelIcon}><SlidersHorizontal size={17} /></span><div><h3>{title}</h3><p>Fine-tune your search</p></div></div>
      {onClose && <button type="button" aria-label="Close filters" className={styles.closeButton} onClick={onClose}><X size={18} /></button>}
    </div>
    <div className={`${styles.panelBody} ${bodyClassName}`}>{children}</div>
    {footer && <div className={styles.panelFooter}>{footer}</div>}
  </div>;
}

// Native top-layer rendering avoids card stacking/animated-ancestor clipping.
export function FilterDialog({ open, onClose, children, footer, title = 'Filters', label = 'Property filters', desktopQuery = '(min-width: 1024px)', bodyClassName = '' }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current, root = document.documentElement, body = document.body, focus = document.activeElement;
    const overflow = { root: root.style.overflow, body: body.style.overflow };
    const media = window.matchMedia(desktopQuery);
    let locked = false;
    const unlock = () => {
      if (dialog.open) dialog.close();
      if (locked) { root.style.overflow = overflow.root; body.style.overflow = overflow.body; locked = false; focus?.focus({ preventScroll: true }); }
    };
    const sync = () => {
      if (media.matches) return unlock();
      if (!dialog.open) dialog.showModal();
      root.style.overflow = 'hidden'; body.style.overflow = 'hidden'; locked = true;
    };
    sync(); media.addEventListener('change', sync);
    return () => { media.removeEventListener('change', sync); unlock(); };
  }, [open, desktopQuery]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(<dialog ref={ref} className={styles.mobileDialog} aria-label={label} onCancel={() => close.current()} onClick={event => { if (event.target === event.currentTarget) close.current(); }}>
    <div className={styles.mobilePanel}>
      <div className={styles.mobileHeader}><div className={styles.panelHeading}><span className={styles.panelIcon}><SlidersHorizontal size={17} /></span><div><h3>{title}</h3><p>Fine-tune your search</p></div></div><button type="button" aria-label="Close filters" onClick={() => close.current()} className={styles.closeButton}><X size={18} /></button></div>
      <div className={`${styles.mobileBody} ${bodyClassName}`}>{children}</div>
      {footer && <div className={styles.mobileFooter}>{footer}</div>}
    </div>
  </dialog>, document.body);
}
