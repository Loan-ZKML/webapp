'use client';
import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { colorSchemes, type ColorVariant } from '@/lib/colors';

type HomeButtonProps = {
    className?: string;
    inNavbar?: boolean;
    colorVariant?: ColorVariant;
};

const HomeButton: React.FC<HomeButtonProps> = ({
    className = '',
    inNavbar = false,
    colorVariant = 'indigo'
}) => {
    const colors = colorSchemes[colorVariant];

    // If in navbar, don't use absolute positioning
    const positionClasses = inNavbar
        ? `${colors.highlight} hover:${colors.text} transition-colors duration-300`
        : `absolute top-6 right-6 ${colors.highlight} hover:${colors.text} transition-colors duration-300`;

    return (
        <Link
            href="/"
            className={`${positionClasses} ${className}`}
            aria-label="Go to home page"
        >
            <Home size={24} />
        </Link>
    );
};

export default HomeButton;