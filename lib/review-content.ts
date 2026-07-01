/** Visible-text length threshold for showing Read more. */
export const REVIEW_EXPAND_THRESHOLD = 280;

/** Split wall-of-text reviews that lack explicit paragraph breaks. */
export const LONG_PARAGRAPH_THRESHOLD = 420;

export const BLOCK_HTML_TAG = /<\/?(?:article|p|h[1-6]|ul|ol|li|blockquote)\b/i;
export const HTML_TAG = /<\/?[a-z][^>]*>/i;

export const INLINE_ALLOWED_TAGS = ['strong', 'em', 'b', 'i'] as const;
export const BLOCK_ALLOWED_TAGS = [
  'article',
  'blockquote',
  'br',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'i',
  'li',
  'ol',
  'p',
  'strong',
  'ul',
  'a',
  'b',
] as const;

export type ReviewBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string; level: 2 | 3 };

export type InlineSegment =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string };

export function normalizeLineEndings(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function convertMarkdownBold(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function brToNewlines(text: string) {
  return text.replace(/<br\s*\/?>/gi, '\n');
}

export function stripTags(text: string) {
  return text.replace(/<[^>]+>/g, '');
}

export function stripBlockWrapper(html: string) {
  return html
    .replace(/<\/?article>/gi, '')
    .replace(/<\/?blockquote>/gi, '')
    .trim();
}

export function parsePlainBlocks(text: string): ReviewBlock[] {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({ kind: 'paragraph' as const, text: paragraph }));
}

export function splitLongParagraph(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= LONG_PARAGRAPH_THRESHOLD) return [trimmed];

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return [trimmed];

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > LONG_PARAGRAPH_THRESHOLD && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 1 ? chunks : [trimmed];
}

export function expandParagraphBlocks(blocks: ReviewBlock[]): ReviewBlock[] {
  const result: ReviewBlock[] = [];
  for (const block of blocks) {
    if (block.kind === 'heading') {
      result.push(block);
      continue;
    }
    for (const text of splitLongParagraph(block.text)) {
      result.push({ kind: 'paragraph', text });
    }
  }
  return result;
}

/** Server-safe length estimate for expand/collapse UI (no HTML sanitizer on Lambda). */
export function reviewPlainTextLength(raw: string | null | undefined) {
  const trimmed = raw?.trim();
  if (!trimmed) return 0;
  return stripTags(normalizeLineEndings(trimmed)).length;
}
