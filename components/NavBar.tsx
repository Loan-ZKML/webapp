// components/NavBar.tsx
'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HomeButton from './HomeButton';
import { colorSchemes, type ColorVariant } from '@/lib/colors';

type NavBarProps = {
    children?: ReactNode;
    backLink?: string;
    backText?: string;
    variant?: ColorVariant;
    showHomeButton?: boolean;
};

const NavBar: React.FC<NavBarProps> = ({
    children,
    backLink,
    backText = 'Back',
    variant = 'indigo',
    showHomeButton = true
}) => {
    const colors = colorSchemes[variant];

    return (
        <div className="flex items-center justify-between">
            {backLink && (
                <Link
                    href={backLink}
                    className={`flex items-center gap-2 ${colors.highlight} hover:${colors.text} transition-colors`}
                >
                    <ArrowLeft size={20} />
                    <span>{backText}</span>
                </Link>
            )}

            {children}

            {/* Only show HomeButton if showHomeButton is true */}
            {showHomeButton && <HomeButton inNavbar={true} colorVariant={variant} />}
        </div>
    );
};

export default NavBar;