'use client';

import { useMemo } from 'react';

import DOMPurify from 'dompurify';

import {
  BLOCK_ALLOWED_TAGS,
  BLOCK_HTML_TAG,
  HTML_TAG,
  INLINE_ALLOWED_TAGS,
  REVIEW_EXPAND_THRESHOLD,
  type InlineSegment,
  type ReviewBlock,
  brToNewlines,
  convertMarkdownBold,
  expandParagraphBlocks,
  normalizeLineEndings,
  parsePlainBlocks,
  stripBlockWrapper,
  stripTags,
} from '@/lib/review-content';
import { cn } from '@/lib/utils';

function sanitizeInlineHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...INLINE_ALLOWED_TAGS],
    ALLOWED_ATTR: [],
  });
}

function sanitizeBlockHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...BLOCK_ALLOWED_TAGS],
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

function parseReviewBlocks(raw: string | null | undefined): ReviewBlock[] {
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

function parseInlineSegments(text: string): InlineSegment[] {
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

function RichText({ text }: { text: string }) {
  const segments = useMemo(() => parseInlineSegments(text), [text]);

  return (
    <>
      {segments.map((segment, index) => (
        <InlineSegmentNode key={index} segment={segment} />
      ))}
    </>
  );
}

function InlineSegmentNode({ segment }: { segment: InlineSegment }) {
  if (segment.kind === 'bold') {
    return <strong className="font-semibold text-zinc-100">{segment.value}</strong>;
  }
  if (segment.kind === 'italic') {
    return <em className="text-zinc-200 italic">{segment.value}</em>;
  }
  return <>{segment.value}</>;
}

function ReviewBlockNode({
  block,
  clamp,
}: {
  block: ReviewBlock;
  clamp?: boolean;
}) {
  if (block.kind === 'heading') {
    return (
      <p
        className={cn(
          'font-semibold text-zinc-100',
          block.level === 2 ? 'text-sm sm:text-base' : 'text-sm',
          clamp && 'line-clamp-4',
        )}
      >
        <RichText text={block.text} />
      </p>
    );
  }

  return (
    <p
      className={cn(
        'whitespace-pre-line text-sm leading-relaxed text-zinc-300 sm:text-base',
        clamp && 'line-clamp-4',
      )}
    >
      <RichText text={block.text} />
    </p>
  );
}

type ReviewContentBodyProps = {
  content: string;
  expanded: boolean;
  className?: string;
};

export function ReviewContentBody({ content, expanded, className }: ReviewContentBodyProps) {
  const blocks = useMemo(() => parseReviewBlocks(content), [content]);
  const plainLength = useMemo(
    () => blocks.reduce((total, block) => total + block.text.length, 0),
    [blocks],
  );
  const truncate = !expanded && plainLength > REVIEW_EXPAND_THRESHOLD;
  const visibleBlocks = truncate ? blocks.slice(0, 1) : blocks;

  if (blocks.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {visibleBlocks.map((block, index) => (
        <ReviewBlockNode
          key={index}
          block={block}
          clamp={truncate && index === visibleBlocks.length - 1}
        />
      ))}
    </div>
  );
}

export { REVIEW_EXPAND_THRESHOLD };
