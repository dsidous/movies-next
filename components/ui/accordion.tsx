'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Content, Header, Item, Root, Trigger } from '@radix-ui/react-accordion';

function Accordion({ className, ...props }: React.ComponentProps<typeof Root>) {
  return <Root className={cn('w-full', className)} data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof Item>) {
  return <Item className={cn(className)} data-slot="accordion-item" {...props} />;
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof Trigger>) {
  return (
    <Header className="flex">
      <Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex w-full flex-1 items-center justify-between gap-3 py-4 text-left text-sm font-medium transition-all outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none',
          '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </Trigger>
    </Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof Content>) {
  return (
    <Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:hidden"
      {...props}
    >
      <div className={cn('pb-4', className)}>{children}</div>
    </Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
