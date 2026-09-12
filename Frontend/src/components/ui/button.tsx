import { type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow-xs hover:bg-primary-hover hover:shadow-sm focus-visible:ring-primary',
        outline:
          'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-primary shadow-xs',
        ghost:
          'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-primary',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm font-semibold',
        sm: 'h-8 px-3 text-xs font-semibold',
        lg: 'h-12 px-6 py-3 text-base font-semibold',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
