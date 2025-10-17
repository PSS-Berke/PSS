'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label ref={ref} className={cn('text-sm font-medium text-foreground', className)} {...props}>
        {children}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
    );
  },
);
Label.displayName = 'Label';

export { Label };
