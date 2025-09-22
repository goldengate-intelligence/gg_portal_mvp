import React from 'react';
import { cn } from '../../logic/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        'text-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}