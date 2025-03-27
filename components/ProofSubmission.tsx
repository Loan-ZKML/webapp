'use client';
import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';
import { contractService } from '@/service/ContractService';
import { ProofParserService } from '@/service/ProofParserService';

const proofParser = new ProofParserService();

const ProofSubmission = () => {
    const [calldataText, setCalldataText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [collateralDetails, setCollateralDetails] = useState<null | { amount: string, percentage: string }>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [bytesRead, setBytesRead] = useState<number | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setErrorMessage('');
        setFileName(file.name);

        try {
            const { hexString, bytes } = await proofParser.readBinaryFile(file);
            setCalldataText(hexString);
            setBytesRead(bytes.length);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to read file');
            console.error('File read error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        setCollateralDetails(null);

        if (!calldataText.trim()) {
            setErrorMessage('Please provide calldata first');
            return;
        }

        const validationResult = proofParser.validateAndParse(calldataText);
        if (!validationResult.isValid) {
            setErrorMessage(validationResult.error || 'Failed to parse calldata');
            return;
        }

        if (!validationResult.data) {
            setErrorMessage('No valid proof data found');
            return;
        }

        setIsSubmitting(true);

        try {
            const isConnected = await contractService.connect();
            if (!isConnected) {
                throw new Error('Failed to connect to wallet. Please try again.');
            }

            const success = await contractService.submitProof(
                validationResult.data.proof,
                validationResult.data.publicInputs
            );

            // At this point, if we got here, the transaction was successful
            setIsSubmitting(false);

            if (success) {
                setSuccessMessage('Proof submitted successfully!');

                // Get account address
                const address = await contractService.getAccount();
                if (address) {
                    try {
                        // Fetch updated collateral requirements (for a 1 ETH loan)
                        const collateral = await contractService.calculateCollateral(address, 1);
                        setCollateralDetails(collateral);
                    } catch (error) {
                        console.error('Failed to get collateral details:', error);
                        // Don't set isSubmitting back to true for this secondary error
                    }
                }
            } else {
                setErrorMessage('Proof verification failed. Please check your proof data.');
            }
        } catch (error: any) {
            setIsSubmitting(false);
            setErrorMessage(error.message || 'An error occurred while submitting the proof');
            console.error('Proof submission error:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Submit Proof</h3>

                <div className="space-y-4">
                    {/* File Upload */}
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
                                onChange={handleFileUpload}
                                disabled={isUploading || isSubmitting}
                            />
                        </label>
                        <p className="text-xs text-indigo-500 mt-1">Upload your calldata.json file containing the raw binary proof data</p>
                    </div>

                    {/* File details (when a file is uploaded) */}
                    {fileName && bytesRead && (
                        <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                            <p className="text-sm text-indigo-700 font-medium">File loaded: {fileName}</p>
                            <p className="text-xs text-indigo-500 mt-1">
                                {bytesRead > 0
                                    ? `${bytesRead} bytes of binary data read`
                                    : 'No valid binary data found'}
                            </p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={!calldataText || isSubmitting}
                    >
                        <FileCode size={20} />
                        {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                    </button>

                    {/* Error message */}
                    {errorMessage && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertTriangle size={18} />
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {/* Success message */}
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
                </div>
            </div>
        </div>
    );
};

export default ProofSubmission;