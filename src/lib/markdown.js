import { Marked, Renderer } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import hljs from 'highlight.js/lib/common';

const escapeHtml = (text) => text.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

// Follow the reference viewer's URI policy, without executable SVG/data documents.
const safeUri = /^(?:(?:https?|mailto|tel):|data:image\/(?:avif|bmp|gif|jpe?g|png|webp);base64,|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;
const sanitizeOptions = {
  USE_PROFILES: { html: true },
  ALLOWED_URI_REGEXP: safeUri,
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'button', 'select', 'textarea', 'video', 'audio', 'source'],
  FORBID_ATTR: ['style', 'id', 'name', 'srcset', 'autofocus'],
};

const restrictDataImages = (_node, attribute) => {
  // DOMPurify permits data: on images separately from ALLOWED_URI_REGEXP.
  if (attribute.attrName === 'src' && /^\s*data:/i.test(attribute.attrValue)
    && !/^data:image\/(?:avif|bmp|gif|jpe?g|png|webp);base64,/i.test(attribute.attrValue)) {
    attribute.keepAttr = false;
  }
};

/** Synchronous on server and browser: never send an unsanitized preview to React. */
export function renderMarkdown(content, { headingOffset = 0 } = {}) {
  if (typeof content !== 'string' || !content.trim()) return '';
  const offset = Number.isInteger(headingOffset) ? Math.max(0, Math.min(5, headingOffset)) : 0;
  const renderer = new Renderer();
  renderer.heading = (text, level) => {
    const heading = Math.min(6, level + offset);
    return `<h${heading}>${text}</h${heading}>\n`;
  };
  renderer.code = (code, info = '') => {
    const requested = info.trim().split(/\s+/)[0].toLowerCase();
    const language = /^[a-z0-9_+-]+$/.test(requested) && hljs.getLanguage(requested) ? requested : 'plaintext';
    // Bound highlighting work for unusually large code fences; never guess a language.
    const highlighted = code.length <= 50_000 && language !== 'plaintext'
      ? hljs.highlight(code, { language, ignoreIllegals: true }).value
      : escapeHtml(code);
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>\n`;
  };
  const image = renderer.image.bind(renderer);
  renderer.image = (...args) => image(...args).replace('<img ', '<img loading="lazy" decoding="async" ');
  const parser = new Marked({ gfm: true, breaks: true, pedantic: false, renderer });
  const html = parser.parse(content);
  DOMPurify.addHook('uponSanitizeAttribute', restrictDataImages);
  try {
    return DOMPurify.sanitize(html, sanitizeOptions);
  } finally {
    // The adapter shares an instance; leave no hooks behind for other consumers.
    DOMPurify.removeHook('uponSanitizeAttribute', restrictDataImages);
  }
}
