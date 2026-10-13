"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, ImageIcon, X } from 'lucide-react';

function Photo({ src, alt, priority = false, sizes = '100vw' }) {
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" unoptimized={!/^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com|plus\.unsplash\.com)\//.test(src)} />;
}

export default function PropertyDetailGallery({ images, title }) {
  const photos = Array.isArray(images) ? images.filter(Boolean) : [];
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const length = photos.length;
  useEffect(() => { setSelected(0); setOpen(false); }, [images]);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element.showModal();
    document.body.style.overflow = 'hidden';
    function keydown(event) {
      if (event.key === 'ArrowRight') setSelected(value => (value + 1) % length);
      if (event.key === 'ArrowLeft') setSelected(value => (value - 1 + length) % length);
    }
    element.addEventListener('keydown', keydown);
    return () => { element.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; if (element.open) element.close(); previousFocus?.focus(); };
  }, [open, length]);
  if (!length) return <div className="flex aspect-[16/7] flex-col items-center justify-center gap-3 rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"><ImageIcon size={35} /><p className="text-sm">The owner hasn’t uploaded photos yet.</p></div>;
  function show(index) { setSelected(index); setOpen(true); }
  return (
    <div>
      <div className={`grid gap-2 overflow-hidden rounded-2xl sm:gap-3 sm:rounded-3xl ${length >= 3 ? 'sm:grid-cols-[1.7fr_1fr]' : ''}`}>
        <button type="button" onClick={() => show(selected)} aria-label="Open image gallery" className="group relative block aspect-[1.65] w-full overflow-hidden bg-slate-100 sm:aspect-[1.9] dark:bg-slate-800"><Photo src={photos[selected] || photos[0]} alt={`${title} — photo ${selected + 1}`} priority sizes={length >= 3 ? '(min-width: 640px) 65vw, 100vw' : '100vw'} /><span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm"><Expand size={14} />{length} {length === 1 ? 'photo' : 'photos'}</span></button>
        {length >= 3 && <div className="hidden min-h-0 grid-rows-2 gap-3 sm:grid">{[1, 2].map(index => <button key={index} type="button" onClick={() => show(index)} aria-label={`View property photo ${index + 1}`} className="relative min-h-0 overflow-hidden bg-slate-100"><Photo src={photos[index]} alt={`${title} — photo ${index + 1}`} sizes="35vw" /></button>)}</div>}
      </div>
      {length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Property photo thumbnails">{photos.slice(0, 10).map((src, index) => <button key={`${src}-${index}`} type="button" aria-label={`Show photo ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 sm:h-16 sm:w-24 ${selected === index ? 'border-indigo-500' : 'border-transparent opacity-65 hover:opacity-100'}`}><Photo src={src} alt="" sizes="96px" /></button>)}</div>}
      {open && <dialog ref={dialog} role="dialog" aria-label={`${title} image gallery`} onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-slate-950/95 p-4 text-white backdrop:bg-slate-950/90 sm:p-8"><div className="flex h-full flex-col gap-5"><div className="flex items-center justify-between gap-4"><p className="truncate text-sm font-medium">{title}</p><button onClick={() => setOpen(false)} aria-label="Close image viewer" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><X size={21} /></button></div><div className="relative min-h-0 flex-1"><Image src={photos[selected] || photos[0]} alt={`${title} — photo ${selected + 1}`} fill sizes="100vw" unoptimized className="object-contain" />{length > 1 && <><button onClick={() => setSelected(value => (value - 1 + length) % length)} aria-label="Previous photo" className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 sm:h-14 sm:w-14"><ChevronLeft /></button><button onClick={() => setSelected(value => (value + 1) % length)} aria-label="Next photo" className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 sm:h-14 sm:w-14"><ChevronRight /></button></>}</div><p className="text-center text-sm text-slate-300">{selected + 1} / {length}</p></div></dialog>}
    </div>
  );
}
