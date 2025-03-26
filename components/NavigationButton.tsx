'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type NavigationButtonProps = {
    href: string;
    title: string;
    description: string;
    isLoaded: boolean;
    isDisabled?: boolean;
    transitionDelay?: string;
    accent?: string;
};

const NavigationButton: React.FC<NavigationButtonProps> = ({
    href,
    title,
    description,
    isLoaded,
    isDisabled = false,
    transitionDelay = '0ms',
    accent = 'indigo',
}) => {
    // Conditional classes based on whether the button is disabled
    const buttonClasses = isDisabled
        ? `block p-4 rounded-xl border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-50 to-white shadow-sm transition-all duration-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
        } opacity-50 cursor-not-allowed`
        : `block p-4 rounded-xl border-l-4 border-l-${accent}-600 bg-gradient-to-r from-${accent}-50 to-white shadow-sm hover:shadow-md hover:bg-${accent}-100/50 hover:scale-[1.02] hover:border-l-${accent}-700 transition-all duration-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
        }`;

    // Conditional text and background colors
    const titleColor = isDisabled ? 'text-gray-700' : `text-${accent}-800`;
    const descriptionColor = isDisabled ? 'text-gray-500' : `text-${accent}-600/70`;
    const iconBgColor = isDisabled ? 'bg-gray-400' : `bg-${accent}-600`;

    return (
        <Link
            href={href}
            className={buttonClasses}
            style={{ transitionDelay }}
            onClick={(e) => isDisabled && e.preventDefault()}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className={`text-xl font-semibold ${titleColor}`}>{title}</h2>
                    <p className={`${descriptionColor} text-sm mt-1`}>{description}</p>
                </div>
                <div className={`${iconBgColor} text-white p-2 rounded-full transform transition-transform group-hover:rotate-12`}>
                    <ArrowRight size={18} />
                </div>
            </div>
        </Link>
    );
};

export default NavigationButton;