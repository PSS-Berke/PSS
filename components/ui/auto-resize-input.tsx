'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface AutoResizeInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoResizeInput = React.forwardRef<HTMLTextAreaElement, AutoResizeInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    React.useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (onChange) {
        onChange(e);
      }
    };

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    return (
      <textarea
        className={cn(
          'flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden max-h-[200px]',
          className,
        )}
        ref={setRefs}
        value={value}
        onChange={handleChange}
        rows={1}
        {...props}
      />
    );
  },
);
AutoResizeInput.displayName = 'AutoResizeInput';

export { AutoResizeInput };
