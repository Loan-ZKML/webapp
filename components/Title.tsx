'use client';
import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type GradientColors = {
    from: string;
    via: string;
    to: string;
};

type TitleProps = {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    variant?: 'centered' | 'hero';
    size?: 'sm' | 'md' | 'lg';
    gradientColors?: GradientColors;
    subtitleColor?: string;
    className?: string;
    isLoaded?: boolean;
};

const Title: React.FC<TitleProps> = ({
    title,
    subtitle,
    icon: Icon,
    variant = 'centered',
    size = 'md',
    gradientColors = { from: 'indigo-700', via: 'purple-600', to: 'violet-500' },
    subtitleColor = 'text-purple-600/80',
    className = '',
    isLoaded = true,
}) => {
    // Size classes
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-4xl',
    };

    // Loading animation classes (only for hero variant)
    const loadingClasses = variant === 'hero' && isLoaded !== undefined
        ? `transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`
        : '';

    // Gradient classes
    const gradientClass = `bg-gradient-to-r from-${gradientColors.from} via-${gradientColors.via} to-${gradientColors.to}`;

    if (variant === 'hero') {
        return (
            <div className={`flex items-center justify-center ${loadingClasses} ${className}`}>
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute -left-6 -top-1 text-purple-600 opacity-80" size={20} />
                    )}
                    <h1 className={`${sizeClasses[size]} font-bold text-center bg-clip-text text-transparent ${gradientClass}`}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={`text-sm text-center ${subtitleColor} mt-2`}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`text-center ${className}`}>
            <h1 className={`${sizeClasses[size]} font-bold bg-clip-text text-transparent ${gradientClass}`}>
                {title}
            </h1>
            {subtitle && (
                <p className={`${subtitleColor} mt-2`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default Title;