'use client';
import React from 'react';
import { HelpCircle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import WalletConnect from '@/components/WalletConnect';
import InfoBox from '@/components/InfoBox';
import NavigationBox from '@/components/NavigationBox';
import NavBar from '@/components/NavBar';
import Title from '@/components/Title';

const RequestPage = () => {
    const steps = [
        { text: 'Connect your Ethereum wallet' },
        { text: 'Submit your proof information' },
        { text: 'Get your personalized collateral requirement' }
    ];

    return (
        <PageLayout size="md">
            <div className="space-y-8 relative">
                <NavBar backLink='/' />

                <Title
                    title="Request Lowered Collateral"
                    subtitle="Get personalized collateral requirements using zero-knowledge proofs"
                />

                <InfoBox
                    title="How it works:"
                    description=""
                    variant="indigo"
                >
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                                    {index + 1}
                                </div>
                                <p className="text-indigo-800">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </InfoBox>

                <WalletConnect />

                <InfoBox
                    title="Need help generating a proof?"
                    description="Follow our step-by-step guide to create and submit your zero-knowledge proof."
                    variant="teal"
                >
                    <NavigationBox
                        href="/guide"
                        icon={HelpCircle}
                        title="View Proof Generation Guide"
                        description="Step-by-step instructions"
                        variant="teal"
                    />
                </InfoBox>
            </div>
        </PageLayout>
    );
};

export default RequestPage;