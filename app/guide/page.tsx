'use client';
import React, { useState, useEffect } from 'react';
import { Code2, Terminal, FileCode, CheckCircle2, Send } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import InfoBox from '@/components/InfoBox';
import NavBar from '@/components/NavBar';
import Title from '@/components/Title';
import NavigationBox from '@/components/NavigationBox';


const GuidePage = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const steps = [
        {
            icon: Code2,
            title: 'Install Required Tools',
            description: 'First, you\'ll need to install the necessary tools to generate your proof.',
            codeExample: '# Clone the repo\ngit clone https://github.com/loan-zkml/Ezkl-ML.git && cd src\n\n# Install Python dependencies\npip install torch numpy onnx\n\n# Install EZKL following instructions at https://github.com/zkonduit/ezkl'
        },
        {
            icon: Terminal,
            title: 'Prepare Your Data',
            description: 'Format your credit information according to the required schema.',
            codeExample: '// Code example will go here'
        },
        {
            icon: FileCode,
            title: 'Generate the Proof',
            description: 'Use the zKML library to create your zero-knowledge proof.',
            codeExample: '// Code example will go here'
        },
        {
            icon: CheckCircle2,
            title: 'Verify Your Proof',
            description: 'Ensure your proof is valid before submission.',
            codeExample: '// Code example will go here'
        },
    ];

    return (
        <PageLayout size="lg"  >
            <div className="space-y-6">
                <NavBar backLink='/request' />

                <Title
                    title="Proof Generation Guide"
                    subtitle="Learn how to generate and submit your zero-knowledge proof"
                />

                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <InfoBox
                            key={index}
                            icon={step.icon}
                            number={index + 1}
                            title={step.title}
                            description={step.description}
                            codeExample={step.codeExample}
                        />
                    ))}
                               

            <NavigationBox
                href="/request"
                icon={Send}
                title="Submit Your Proof"
                description="Ready to submit? Go to the request page"
                variant="indigo"
                />
                    
                </div>
            </div>
        </PageLayout>
    );
};

export default GuidePage;
