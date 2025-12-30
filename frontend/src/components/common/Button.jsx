import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component with various styles and sizes.
 * 
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [props.variant='primary'] - Visual style variant
 * @param {'sm' | 'default' | 'lg' | 'icon'} [props.size='default'] - Size variant
 * @param {boolean} [props.isLoading=false] - Show loading spinner
 * @param {React.ReactNode} props.children - Button content
 * @param {boolean} [props.disabled] - Disable button
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Button type
 */
const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    children,
    disabled,
    type = 'button',
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary/50',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/50',
        ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-500/50',
        danger: 'bg-error text-white hover:bg-red-600 focus:ring-error/50',
    };

    const sizes = {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10',
    };

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
