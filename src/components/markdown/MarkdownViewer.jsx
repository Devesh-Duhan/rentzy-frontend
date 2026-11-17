"use client";

import { useMemo } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github.css';
import styles from './MarkdownViewer.module.css';

/** Reusable, server-rendered Markdown preview; content is always sanitized first. */
export default function MarkdownViewer({ content, headingOffset = 0, className = '' }) {
  const html = useMemo(() => renderMarkdown(content, { headingOffset }), [content, headingOffset]);
  if (!html) return <p>No content provided for this article.</p>;
  return <div className={`markdown-body ${styles.viewer} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
