'use client';
import React from 'react';

interface PageLayoutProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';  // sm = max-w-md, md = max-w-2xl, lg = max-w-4xl
}

const PageLayout = ({ children, size = 'sm' }: PageLayoutProps) => {
    const maxWidth = {
        sm: 'max-w-md',    // 28rem / 448px
        md: 'max-w-2xl',   // 42rem / 672px
        lg: 'max-w-3xl',
        xl: 'max-w-4xl'    // 56rem / 896px
    }[size];

    return (
        <div className="min-h-screen bg-gradient-to-t from-indigo-900 via-purple-300 to-white">
            <div className="fixed inset-0 bg-gradient-to-t from-indigo-900/40 via-purple-300/20 to-white/10 backdrop-blur-sm transition-opacity duration-1000"></div>

            <main className="min-h-screen p-8 flex items-center justify-center relative z-10">
                <div className={`${maxWidth} w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-purple-100`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PageLayout; 