'use client';
import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { contractService } from '@/service/ContractService';
import { ProofParserService } from '@/service/ProofParserService';

// Types
interface CollateralDetails {
    amount: string;
    percentage: string;
}

interface SubmissionState {
    calldataText: string;
    isUploading: boolean;
    isSubmitting: boolean;
    isSubmitted: boolean; // New state to track if transaction has been submitted successfully
    errorMessage: string;
    successMessage: string;
    collateralDetails: CollateralDetails | null;
    fileName: string | null;
    bytesRead: number | null;
    transactionHash: string | null; // Add to store transaction hash
}

const initialState: SubmissionState = {
    calldataText: '',
    isUploading: false,
    isSubmitting: false,
    isSubmitted: false, // Initialize as false
    errorMessage: '',
    successMessage: '',
    collateralDetails: null,
    fileName: null,
    bytesRead: null,
    transactionHash: null, // Initialize as null
};

const ProofSubmission = () => {
    const [state, setState] = useState<SubmissionState>(initialState);
    const proofParser = new ProofParserService();

    const updateState = (updates: Partial<SubmissionState>) => {
        setState(current => ({ ...current, ...updates }));
    };

    const resetMessages = () => {
        updateState({
            errorMessage: '',
            successMessage: '',
            collateralDetails: null,
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        updateState({
            isUploading: true,
            errorMessage: '',
            fileName: file.name,
        });

        try {
            const { hexString, bytes } = await proofParser.readBinaryFile(file);
            updateState({
                calldataText: hexString,
                bytesRead: bytes.length,
            });
        } catch (error: any) {
            updateState({
                errorMessage: error.message || 'Failed to read file',
            });
            console.error('File read error:', error);
        } finally {
            updateState({ isUploading: false });
        }
    };

    const fetchCollateralDetails = async (address: string) => {
        try {
            const collateral = await contractService.calculateCollateral(address, 1);
            updateState({ collateralDetails: collateral });
        } catch (error) {
            console.error('Failed to get collateral details:', error);
        }
    };

    const handleSubmit = async () => {
        resetMessages();
        updateState({ isSubmitted: false, transactionHash: null }); // Reset submission state

        if (!state.calldataText.trim()) {
            updateState({ errorMessage: 'Please provide calldata first' });
            return;
        }

        const validationResult = proofParser.validateAndParse(state.calldataText);
        if (!validationResult.isValid || !validationResult.data) {
            updateState({
                errorMessage: validationResult.error || 'Failed to parse calldata'
            });
            return;
        }

        updateState({ isSubmitting: true });

        try {
            const isConnected = await contractService.connect();
            if (!isConnected) {
                throw new Error('Failed to connect to wallet. Please try again.');
            }

            // Submit proof and capture transaction hash
            const transactionResponse = await contractService.submitProofAndGetTransaction(
                validationResult.data.proof,
                validationResult.data.publicInputs
            );

            if (transactionResponse && transactionResponse.hash) {
                // Store transaction hash
                updateState({
                    transactionHash: transactionResponse.hash,
                    successMessage: 'Transaction sent! Waiting for confirmation...'
                });

                // Wait for transaction to be confirmed
                const receipt = await transactionResponse.wait(1);

                if (!receipt) {
                    updateState({
                        errorMessage: 'Transaction failed to confirm. Please check your transaction status.'
                    });
                    return;
                }

                if (receipt.status === 1) {
                    updateState({
                        isSubmitted: true,
                        isSubmitting: false,
                        successMessage: 'Proof verified and submitted successfully!'
                    });

                    const address = await contractService.getAccount();
                    if (address) {
                        await fetchCollateralDetails(address);
                    }
                } else {
                    updateState({
                        errorMessage: 'Transaction failed. Please check your proof data.'
                    });
                }
            } else {
                updateState({
                    errorMessage: 'Failed to submit transaction. Please try again.'
                });
            }
        } catch (error: any) {
            updateState({
                errorMessage: error.message || 'An error occurred while submitting the proof'
            });
            console.error('Proof submission error:', error);
        } finally {
            updateState({ isSubmitting: false });
        }
    };

    const handleReset = () => {
        setState(initialState);
    };

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Submit Proof</h3>

                <div className="space-y-4">
                    {!state.isSubmitted ? (
                        <>
                            <FileUploadSection
                                fileName={state.fileName}
                                isUploading={state.isUploading}
                                isSubmitting={state.isSubmitting}
                                onUpload={handleFileUpload}
                            />

                            <FileDetailsSection
                                fileName={state.fileName}
                                bytesRead={state.bytesRead}
                            />

                            <SubmitButton
                                isSubmitting={state.isSubmitting}
                                disabled={!state.calldataText || state.isSubmitting}
                                onClick={handleSubmit}
                            />
                        </>
                    ) : (
                        <SuccessSection
                            collateralDetails={state.collateralDetails}
                            transactionHash={state.transactionHash}
                            onReset={handleReset}
                        />
                    )}

                    <StatusMessages
                        errorMessage={state.errorMessage}
                        successMessage={state.successMessage}
                        isSubmitted={state.isSubmitted}
                    />
                </div>
            </div>
        </div>
    );
};

// Subcomponents
const FileUploadSection = ({ fileName, isUploading, isSubmitting, onUpload }: {
    fileName: string | null;
    isUploading: boolean;
    isSubmitting: boolean;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div>
        <label
            htmlFor="proof-file"
            className="flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 rounded-lg p-4 cursor-pointer hover:bg-indigo-50 transition-colors"
        >
            <Upload size={20} className="text-indigo-500" />
            <span className="text-indigo-700">
                {isUploading ? 'Uploading...' : fileName || 'Upload calldata.json'}
            </span>
            <input
                id="proof-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={onUpload}
                disabled={isUploading || isSubmitting}
            />
        </label>
        <p className="text-xs text-indigo-500 mt-1">
            Upload your calldata.json file containing the raw binary proof data
        </p>
    </div>
);

const FileDetailsSection = ({ fileName, bytesRead }: {
    fileName: string | null;
    bytesRead: number | null;
}) => {
    if (!fileName || !bytesRead) return null;

    return (
        <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium">File loaded: {fileName}</p>
            <p className="text-xs text-indigo-500 mt-1">
                {bytesRead > 0
                    ? `${bytesRead} bytes of binary data read`
                    : 'No valid binary data found'}
            </p>
        </div>
    );
};

const SubmitButton = ({ isSubmitting, disabled, onClick }: {
    isSubmitting: boolean;
    disabled: boolean;
    onClick: () => void;
}) => (
    <button
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
        onClick={onClick}
        disabled={disabled}
    >
        {isSubmitting ? (
            <>
                <RefreshCw size={20} className="animate-spin" />
                Submitting...
            </>
        ) : (
            <>
                <FileCode size={20} />
                Submit Proof
            </>
        )}
    </button>
);

const SuccessSection = ({ collateralDetails, transactionHash, onReset }: {
    collateralDetails: CollateralDetails | null;
    transactionHash: string | null;
    onReset: () => void;
}) => (
    <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle size={24} className="text-green-600" />
            </div>

            <h3 className="text-lg font-semibold text-green-800 mb-1">Proof Verified!</h3>
            <p className="text-sm text-green-600 text-center mb-4">
                Your zero-knowledge proof has been verified and recorded on-chain.
            </p>

            {collateralDetails && (
                <div className="w-full bg-white p-3 rounded-lg border border-green-100 mb-3">
                    <h4 className="font-medium text-green-800 mb-2">Your New Collateral Requirement:</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 p-2 rounded">
                            <p className="text-xs text-green-600">Amount</p>
                            <p className="text-lg font-semibold text-green-800">{collateralDetails.amount} ETH</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                            <p className="text-xs text-green-600">Percentage</p>
                            <p className="text-lg font-semibold text-green-800">{collateralDetails.percentage}</p>
                        </div>
                    </div>
                </div>
            )}

            {transactionHash && (
                <div className="w-full mb-3">
                    <p className="text-xs text-green-600 mb-1">Transaction Hash:</p>
                    <code className="block w-full bg-white text-xs p-2 rounded border border-green-100 overflow-x-auto">
                        {transactionHash}
                    </code>
                </div>
            )}

            <button
                onClick={onReset}
                className="mt-2 px-4 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
                Submit Another Proof
            </button>
        </div>
    </div>
);

const StatusMessages = ({ errorMessage, successMessage, isSubmitted }: {
    errorMessage: string;
    successMessage: string;
    isSubmitted: boolean;
}) => {
    if (isSubmitted) return null; // Don't show status messages when in success state

    return (
        <>
            {errorMessage && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertTriangle size={18} />
                    <p>{errorMessage}</p>
                </div>
            )}

            {successMessage && !isSubmitted && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <RefreshCw size={18} className="animate-spin" />
                    <p>{successMessage}</p>
                </div>
            )}
        </>
    );
};

export default ProofSubmission;