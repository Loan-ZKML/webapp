import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { colorSchemes, type ColorVariant } from '@/lib/colors';

interface NavigationBoxProps {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
    variant?: ColorVariant;
    disabled?: boolean;
}

const NavigationBox = ({ href, icon: Icon, title, description, variant = 'indigo', disabled = false }: NavigationBoxProps) => {
    const colors = colorSchemes[variant];

    return (
        <Link
            href={disabled ? '#' : href}
            className={`block p-4 rounded-xl border-l-4 ${colors.border} bg-gradient-to-r ${colors.bg} to-white 
                shadow-sm hover:shadow-md ${colors.bgHover} hover:scale-[1.02] ${colors.borderHover} 
                transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={e => disabled && e.preventDefault()}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Icon className={colors.icon} size={20} />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                        <p className="text-gray-600/70 text-sm mt-1">{description}</p>
                    </div>
                </div>
                <div className={`${colors.button} text-white p-2 rounded-full transform transition-transform group-hover:rotate-12`}>
                    <ArrowRight size={18} />
                </div>
            </div>
        </Link>
    );
};

export default NavigationBox; 