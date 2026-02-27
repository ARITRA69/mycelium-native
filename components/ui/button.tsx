import type { FC, ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl active:opacity-80',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'bg-muted',
        outline: 'border border-border bg-transparent',
        ghost: 'bg-transparent',
        destructive: 'bg-red-600',
      },
      size: {
        sm: 'h-9 px-4 gap-1.5',
        md: 'h-11 px-5 gap-2',
        lg: 'h-14 px-6 gap-2.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground font-medium',
      destructive: 'text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-[15px]',
      lg: 'text-base',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children?: ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
};

export const Button: FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className,
}) => {
  const isDisabled = disabled || loading;
  const displayIcon = loading ? <ActivityIndicator size="small" color="white" /> : icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size }), isDisabled ? 'opacity-50' : '', className ?? '')}
    >
      {iconPosition === 'left' && displayIcon}
      {typeof children === 'string' ? (
        <Text className={buttonTextVariants({ variant, size })}>{children}</Text>
      ) : (
        children
      )}
      {iconPosition === 'right' && displayIcon}
    </Pressable>
  );
};
