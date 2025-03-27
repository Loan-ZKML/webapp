'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <PageLayout>
      <div className={`space-y-8 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex items-center justify-center">
          <div className="relative">
            <Zap className="absolute -left-6 -top-1 text-purple-600 opacity-80" size={20} />
            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-500">
              Smart Collateral
            </h1>
            <p className="text-sm text-center text-purple-600/80 mt-2">
              Lower collateral requirements leveraging zKML
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/request"
            className={`block p-4 rounded-xl border-l-4 border-l-indigo-600 bg-gradient-to-r from-indigo-50 to-white shadow-sm hover:shadow-md hover:bg-indigo-100/50 hover:scale-[1.02] hover:border-l-indigo-700 transition-all duration-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-indigo-800">Request Smart Collateral</h2>
                <p className="text-indigo-600/70 text-sm mt-1">Step-by-step submission of request</p>
              </div>
              <div className="bg-indigo-600 text-white p-2 rounded-full transform transition-transform group-hover:rotate-12">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>

          <Link
            href="/verify"
            className={`block p-4 rounded-xl border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-50 to-white shadow-sm transition-all duration-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'} opacity-50 cursor-not-allowed`}
            style={{ transitionDelay: '300ms' }}
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Check Application Status</h2>
                <p className="text-gray-500 text-sm mt-1">View your verification results</p>
              </div>
              <div className="bg-gray-400 text-white p-2 rounded-full">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-purple-100 text-center">
          <p className="text-xs text-purple-400">Private • Better Terms</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;