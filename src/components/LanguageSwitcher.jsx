'use client';
import { useState } from 'react';
import { setLanguage, getLanguage, subscribe } from '@/lib/i18n';
import { useEffect } from 'react';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    const unsub = subscribe((l) => setLang(l));
    return unsub;
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 transition"
      title="Switch Language"
    >
      <Languages size={14} />
      <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}
