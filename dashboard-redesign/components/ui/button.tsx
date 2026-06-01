import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type MotionProps } from 'framer-motion'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[box-shadow,transform,background-color] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default:
          'bg-[var(--component-btn-bg)] text-[var(--component-btn-text)] shadow-soft-sm hover:shadow-glow-brand hover:bg-[color:var(--component-btn-bg)_/_0.98] focus-visible:ring-[var(--state-focus-ring-width)] focus-visible:ring-[var(--ring)] focus-visible:ring-opacity-40',
        destructive:
          'bg-[var(--destructive)] text-[var(--text-inverse)] hover:bg-[color:var(--destructive)_/_0.92] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-[var(--component-btn-border)] bg-[var(--component-btn-ghost-bg)] hover:shadow-soft-sm hover:bg-[var(--component-btn-secondary-bg)] hover:text-[var(--component-btn-secondary-text)]',
        secondary:
          'bg-[var(--component-btn-secondary-bg)] text-[var(--component-btn-secondary-text)] hover:bg-[color:var(--component-btn-secondary-bg)_/_0.9]',
        ghost:
          'bg-transparent text-[var(--component-btn-ghost-text)] hover:bg-[var(--state-hover-bg)]',
        link: 'text-[var(--brand-500)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[44px] h-11 px-6 rounded-full has-[>svg]:px-3',
        sm: 'min-h-[36px] h-9 px-4 rounded-full gap-1.5 has-[>svg]:px-2.5',
        lg: 'min-h-[52px] h-12 px-8 rounded-full has-[>svg]:px-4',
        icon: 'h-9 w-9 p-2 rounded-full',
        'icon-sm': 'h-8 w-8 p-1.5 rounded-full',
        'icon-lg': 'h-11 w-11 p-3 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  whileHover,
  whileTap,
  ...props
}: (React.ComponentProps<'button'> & MotionProps) &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp: React.ElementType = asChild ? Slot : motion.button

  const defaultHover = { scale: 1.02, y: -2, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }
  const defaultTap = { scale: 0.985, y: 0, transition: { duration: 0.12 } }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={whileHover ?? defaultHover}
      whileTap={whileTap ?? defaultTap}
      {...props}
    />
  )
}

export { Button }
