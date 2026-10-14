"use client";

import { useEffect, useRef, useState } from 'react';

export default function useNearViewport({ enabled = true, resetKey = null, rootMargin = '300px 0px' } = {}) {
  const ref = useRef(null);
  const [observedKey, setObservedKey] = useState();
  const visible = observedKey === resetKey;

  useEffect(() => {
    const element = ref.current;
    if (!enabled || visible || !element) return;
    if (!('IntersectionObserver' in window)) { setObservedKey(resetKey); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setObservedKey(resetKey);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, visible, resetKey, rootMargin]);

  return [ref, enabled && visible];
}
