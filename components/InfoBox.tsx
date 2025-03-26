import React from 'react';
import { LucideIcon } from 'lucide-react';
import { colorSchemes, type ColorVariant } from '@/lib/colors';

interface InfoBoxProps {
    icon?: LucideIcon;
    number?: number;
    title: string;
    description: string;
    codeExample?: string;
    variant?: ColorVariant;
    className?: string;
    children?: React.ReactNode;
}

const InfoBox = ({
    icon: Icon,
    number,
    title,
    description,
    codeExample,
    variant = 'indigo',
    className = '',
    children
}: InfoBoxProps) => {
    const colors = colorSchemes[variant];

    return (
        <div className={`bg-gradient-to-r ${colors.bg} rounded-lg p-4 border ${colors.borderColor} ${className}`}>
            <div className="flex items-start gap-3">
                {(Icon || number) && (
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full ${colors.icon} flex items-center justify-center`}>
                        {Icon ? <Icon size={16} /> : <span className="text-sm font-semibold">{number}</span>}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h2 className={`text-lg font-semibold ${colors.title} mb-2`}>{title}</h2>
                    <p className={`text-sm ${colors.text} mb-3`}>{description}</p>
                    {codeExample && (
                        <div className="bg-white rounded-md p-3 border border-indigo-100">
                            <pre className="text-xs text-indigo-900">
                                <code>{codeExample}</code>
                            </pre>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default InfoBox; 