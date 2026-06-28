import DOMPurify from 'isomorphic-dompurify';

/** Visible-text length threshold for showing Read more. */
export const REVIEW_EXPAND_THRESHOLD = 280;

/** Split wall-of-text reviews that lack explicit paragraph breaks. */
const LONG_PARAGRAPH_THRESHOLD = 420;

const BLOCK_HTML_TAG = /<\/?(?:article|p|h[1-6]|ul|ol|li|blockquote)\b/i;
const HTML_TAG = /<\/?[a-z][^>]*>/i;

const INLINE_ALLOWED_TAGS = ['strong', 'em', 'b', 'i'];
const BLOCK_ALLOWED_TAGS = [
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
];

export type ReviewBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string; level: 2 | 3 };

export type InlineSegment =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string };

function normalizeLineEndings(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function convertMarkdownBold(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function brToNewlines(text: string) {
  return text.replace(/<br\s*\/?>/gi, '\n');
}

function stripTags(text: string) {
  return text.replace(/<[^>]+>/g, '');
}

function sanitizeInlineHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: INLINE_ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });
}

function sanitizeBlockHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BLOCK_ALLOWED_TAGS,
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^https?:/i,
  });
}

function parseHtmlBlocks(html: string): ReviewBlock[] {
  const sanitized = sanitizeBlockHtml(html);
  const blocks: ReviewBlock[] = [];
  const re = /<(h[1-3]|p)[^>]*>([\s\S]*?)<\/\1>/gi;

  for (const match of sanitized.matchAll(re)) {
    const tag = match[1]!.toLowerCase();
    const rawInner = brToNewlines(match[2]!.trim());
    if (!rawInner) continue;

    if (tag.startsWith('h')) {
      blocks.push({
        kind: 'heading',
        level: tag === 'h3' ? 3 : 2,
        text: stripTags(rawInner).trim(),
      });
    } else {
      blocks.push({ kind: 'paragraph', text: rawInner });
    }
  }

  if (blocks.length === 0 && sanitized.trim()) {
    blocks.push({
      kind: 'paragraph',
      text: brToNewlines(stripBlockWrapper(sanitized)),
    });
  }

  return blocks;
}

function stripBlockWrapper(html: string) {
  return html
    .replace(/<\/?article>/gi, '')
    .replace(/<\/?blockquote>/gi, '')
    .trim();
}

function parsePlainBlocks(text: string): ReviewBlock[] {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({ kind: 'paragraph' as const, text: paragraph }));
}

function splitLongParagraph(text: string): string[] {
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

function expandParagraphBlocks(blocks: ReviewBlock[]): ReviewBlock[] {
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

export function parseReviewBlocks(raw: string | null | undefined): ReviewBlock[] {
  const trimmed = raw?.trim();
  if (!trimmed) return [];

  const text = normalizeLineEndings(trimmed);

  if (BLOCK_HTML_TAG.test(text)) {
    return expandParagraphBlocks(parseHtmlBlocks(text));
  }

  if (HTML_TAG.test(text)) {
    return expandParagraphBlocks(
      parsePlainBlocks(text).map((block) => ({
        ...block,
        text: brToNewlines(block.text),
      })),
    );
  }

  return expandParagraphBlocks(parsePlainBlocks(text));
}

export function parseInlineSegments(text: string): InlineSegment[] {
  const withBold = convertMarkdownBold(text);
  const safe = sanitizeInlineHtml(withBold);
  const segments: InlineSegment[] = [];
  const parts = safe.split(/(<\/?(?:strong|em|b|i)>)/gi);

  let bold = false;
  let italic = false;

  for (const part of parts) {
    const token = part.toLowerCase();
    if (token === '<strong>' || token === '<b>') {
      bold = true;
      continue;
    }
    if (token === '</strong>' || token === '</b>') {
      bold = false;
      continue;
    }
    if (token === '<em>' || token === '<i>') {
      italic = true;
      continue;
    }
    if (token === '</em>' || token === '</i>') {
      italic = false;
      continue;
    }
    if (!part) continue;

    if (bold) segments.push({ kind: 'bold', value: part });
    else if (italic) segments.push({ kind: 'italic', value: part });
    else segments.push({ kind: 'text', value: part });
  }

  return segments;
}

export function reviewPlainTextLength(raw: string | null | undefined) {
  return parseReviewBlocks(raw).reduce((total, block) => total + block.text.length, 0);
}
