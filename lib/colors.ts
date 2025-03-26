export const colorSchemes = {
    indigo: {
        gradient: 'from-indigo-700 via-purple-600 to-violet-500',
        border: 'border-l-indigo-600',
        borderHover: 'hover:border-l-indigo-700',
        bg: 'from-indigo-50 to-purple-50',
        bgHover: 'hover:bg-indigo-100/50',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        button: 'bg-indigo-600',
        title: 'text-indigo-900',
        text: 'text-indigo-800',
        borderColor: 'border-indigo-100',
        highlight: 'text-indigo-600/80'
    },
    teal: {
        gradient: 'from-teal-700 via-emerald-600 to-green-500',
        border: 'border-l-teal-500',
        borderHover: 'hover:border-l-teal-600',
        bg: 'from-teal-50 to-emerald-50',
        bgHover: 'hover:bg-teal-100/50',
        icon: 'text-teal-600',
        iconBg: 'bg-teal-100',
        button: 'bg-teal-500',
        title: 'text-teal-900',
        text: 'text-teal-800',
        borderColor: 'border-teal-100',
        highlight: 'text-teal-600/80'
    }
} as const;

export type ColorVariant = keyof typeof colorSchemes; 