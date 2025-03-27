'use client';
import React, { useState } from 'react';
import { RefreshCw, Calculator, AlertTriangle } from 'lucide-react';
import InfoBox from '@/components/InfoBox';
import { contractService } from '@/service/ContractService';

// Types
export interface CollateralDetails {
    amount: string;
    percentage: string;
}

interface CollateralSectionProps {
    className?: string;
}

const CollateralSection: React.FC<CollateralSectionProps> = ({ className = '' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [collateralDetails, setCollateralDetails] = useState<CollateralDetails | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [loanAmount, setLoanAmount] = useState<number>(1);

    const handleGetCollateral = async () => {
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            // First connect wallet if not already connected
            const isConnected = await contractService.connect();
            
            if (!isConnected) {
                throw new Error('Wallet connection required. Please connect your wallet first.');
            }
            
            const address = await contractService.getAccount();
            
            if (!address) {
                throw new Error('No wallet address found');
            }
            
            const collateral = await contractService.calculateCollateral(address, loanAmount);
            setCollateralDetails(collateral);
            
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to get collateral details');
            console.error('Collateral calculation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <InfoBox
                title="Check Your Collateral Requirements"
                description="See what collateral would be required for your loan based on your current credit tier."
                variant="teal"
            >
                <div className="space-y-4 mt-3">
                    <div className="flex gap-3">
                        <div className="flex-grow">
                            <label htmlFor="loan-amount" className="block text-sm text-teal-700 mb-1">
                                Loan Amount (ETH)
                            </label>
                            <input
                                id="loan-amount"
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                min="0.1"
                                step="0.1"
                                className="w-full p-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleGetCollateral}
                            disabled={isLoading}
                            className="h-10 self-end flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Calculator size={18} />
                                    Check
                                </>
                            )}
                        </button>
                    </div>

                    {collateralDetails && (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                            <h4 className="font-medium text-teal-800 mb-2">Your Collateral Requirement:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-teal-100/50 p-3 rounded">
                                    <p className="text-xs text-teal-600">Amount</p>
                                    <p className="text-lg font-semibold text-teal-800">{collateralDetails.amount} ETH</p>
                                </div>
                                <div className="bg-teal-100/50 p-3 rounded">
                                    <p className="text-xs text-teal-600">Percentage</p>
                                    <p className="text-lg font-semibold text-teal-800">{collateralDetails.percentage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertTriangle size={18} />
                            <p>{errorMessage}</p>
                        </div>
                    )}
                </div>
            </InfoBox>
        </div>
    );
};

export default CollateralSection;