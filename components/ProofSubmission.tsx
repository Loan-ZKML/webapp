'use client';
import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';
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
    errorMessage: string;
    successMessage: string;
    collateralDetails: CollateralDetails | null;
    fileName: string | null;
    bytesRead: number | null;
}

const initialState: SubmissionState = {
    calldataText: '',
    isUploading: false,
    isSubmitting: false,
    errorMessage: '',
    successMessage: '',
    collateralDetails: null,
    fileName: null,
    bytesRead: null,
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

            const success = await contractService.submitProof(
                validationResult.data.proof,
                validationResult.data.publicInputs
            );

            if (success) {
                updateState({ successMessage: 'Proof submitted successfully!' });
                const address = await contractService.getAccount();
                if (address) {
                    await fetchCollateralDetails(address);
                }
            } else {
                updateState({
                    errorMessage: 'Proof verification failed. Please check your proof data.'
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

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Submit Proof</h3>

                <div className="space-y-4">
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
                        disabled={!state.calldataText}
                        onClick={handleSubmit}
                    />

                    <StatusMessages
                        errorMessage={state.errorMessage}
                        successMessage={state.successMessage}
                        collateralDetails={state.collateralDetails}
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
        disabled={disabled || isSubmitting}
    >
        <FileCode size={20} />
        {isSubmitting ? 'Submitting...' : 'Submit Proof'}
    </button>
);

const StatusMessages = ({ errorMessage, successMessage, collateralDetails }: {
    errorMessage: string;
    successMessage: string;
    collateralDetails: CollateralDetails | null;
}) => (
    <>
        {errorMessage && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertTriangle size={18} />
                <p>{errorMessage}</p>
            </div>
        )}

        {successMessage && (
            <div className="flex items-start gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                    <p>{successMessage}</p>
                    {collateralDetails && (
                        <div className="mt-2 text-sm">
                            <p className="font-semibold">Your New Collateral Requirement:</p>
                            <p>Amount: {collateralDetails.amount} ETH</p>
                            <p>Percentage: {collateralDetails.percentage}</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </>
);

export default ProofSubmission;