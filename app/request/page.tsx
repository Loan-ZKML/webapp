'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { contractService } from '@/service/ContractService';
import { CreditTier } from '@/types/contract';
import { CreditApplicant } from '@/types/zkml';


// TODO fix form data to be accurate
// Credit score request form with smart contract integration
const RequestPage = () => {
    const [formData, setFormData] = useState<CreditApplicant>({
        name: '',
        income: 0,
        employmentYears: 0,
        existingLoans: 0,
        creditScore: undefined,
        requestedAmount: 0,
        purpose: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [proofGenerated, setProofGenerated] = useState(false);
    const [proofId, setProofId] = useState('');
    const [walletConnected, setWalletConnected] = useState(false);
    const [account, setAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Connect to MetaMask when component mounts
    useEffect(() => {
        const connectWallet = async () => {
            try {
                const connected = await contractService.connect();
                setWalletConnected(connected);

                if (connected) {
                    const userAccount = await contractService.getAccount();
                    setAccount(userAccount);
                }
            } catch (err) {
                console.error('Error connecting wallet:', err);
                setError('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
            }
        };

        connectWallet();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'name' || name === 'purpose' ? value : Number(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (!walletConnected || !account) {
                throw new Error('Wallet not connected. Please connect your MetaMask wallet.');
            }

            // Generate ZK proof
            const { proof, publicInputs } = await contractService.generateProof(formData);

            // In a real implementation, you would submit this to the contract

            // For the POC, we'll just simulate success
            const mockProofId = 'zkp_' + Array.from(proof.slice(0, 4))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            setProofId(mockProofId);
            setProofGenerated(true);

        } catch (error) {
            console.error('Error in proof generation:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 text-white">
                <Link href="/" className="text-blue-300 hover:text-blue-200 hover:underline mb-4 inline-flex items-center">
                    <span className="mr-2">←</span> Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                    Request a ZKML Credit Loan
                </h1>

                {!walletConnected && (
                    <div className="bg-white/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-blue-200 mb-2">Wallet Connection Required</h2>
                        <p className="mb-4 text-gray-300">Please connect your Ethereum wallet to proceed with the loan application.</p>
                        <button
                            onClick={() => contractService.connect().then(connected => setWalletConnected(connected))}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Connect Wallet
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/50 border border-red-500/20 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {proofGenerated ? (
                    <div className="bg-white/10 backdrop-blur-sm border border-green-500/20 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-green-700 mb-2">Proof Generated Successfully!</h2>
                        <p className="mb-4">Your creditworthiness has been verified using zero-knowledge proofs. No sensitive data was exposed.</p>

                        <div className="bg-white p-4 rounded border mb-4">
                            <span className="font-mono text-sm">Proof ID: {proofId}</span>
                        </div>

                        <Link href={`/verify?proofId=${proofId}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Proceed to Verification
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-white/5 border border-blue-500/20 rounded w-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Other form fields would go here */}
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-300"
                                disabled={isSubmitting || !walletConnected}
                            >
                                {isSubmitting ? 'Generating Proof...' : 'Generate Zero-Knowledge Proof'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RequestPage;