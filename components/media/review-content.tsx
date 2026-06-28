'use client';

import { useMemo } from 'react';

import {
  REVIEW_EXPAND_THRESHOLD,
  type InlineSegment,
  type ReviewBlock,
  parseInlineSegments,
  parseReviewBlocks,
  reviewPlainTextLength,
} from '@/lib/review-content';
import { cn } from '@/lib/utils';

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
  const plainLength = useMemo(() => reviewPlainTextLength(content), [content]);
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

export { REVIEW_EXPAND_THRESHOLD, reviewPlainTextLength };
