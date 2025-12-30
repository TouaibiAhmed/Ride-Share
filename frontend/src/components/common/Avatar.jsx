import React from 'react';
import { cn } from '../../utils/helpers';
import { User } from 'lucide-react';

const Avatar = ({ src, alt, size = 'md', className }) => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
    };

    return (
        <div
            className={cn(
                'relative inline-flex shrink-0 overflow-hidden rounded-full bg-slate-100',
                sizes[size],
                className
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || 'Avatar'}
                    className="aspect-square h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500">
                    <User className="h-1/2 w-1/2" />
                </div>
            )}
        </div>
    );
};

export default Avatar;
