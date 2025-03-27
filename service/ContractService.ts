'use client'; // must render client-side

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers"; // supports legacy provider interfaces and EIP-1193
import { CreditTier, CollateralRequirement } from '@/types/contract'
import { LOAN_MANAGER_ABI } from './abi/CreditScoreLoanManager';
import { WalletService } from './WalletService';

const CONTRACT_ADDRESS = '0x4ebEA61E6a2E4e9E4EcCC84711f001a13D6B406C';
const ANVIL_CHAIN_ID = 31337; // standard chain ID for Anvil

export interface ParsedProofData {
    proof: Uint8Array;
    publicInputs: number[];
}

// Service for interacting with the smart contract
export class ContractService {
    private contract: ethers.Contract | null = null;
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService(ANVIL_CHAIN_ID);
    }

    async connect(): Promise<boolean> {
        const { success, signer } = await this.walletService.connect();

        if (success && signer) {
            this.contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                LOAN_MANAGER_ABI,
                signer
            );
            return true;
        }
        return false;
    }

    /**
     * Submits a proof and returns the transaction response object
     * for better tracking of the transaction status
     */
    async submitProofAndGetTransaction(proof: Uint8Array, publicInputs: number[]): Promise<ethers.TransactionResponse | null> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const proofBytes = ethers.hexlify(proof);
            const inputs = publicInputs.map(input => BigInt(input));
            
            // Return the transaction response instead of waiting for confirmation
            const tx = await this.contract.submitCreditScoreProof(proofBytes, inputs);
            return tx;
        } catch (error) {
            console.error('Internal error:', error);
            throw new Error('Failed to process transaction');
        }
    }

    async submitProof(proof: Uint8Array, publicInputs: number[]): Promise<boolean> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const proofBytes = ethers.hexlify(proof);
            const inputs = publicInputs.map(input => BigInt(input));
            const tx = await this.contract.submitCreditScoreProof(proofBytes, inputs);
            const receipt = await tx.wait(2);
            return receipt.status === 1;
        } catch (error) {
            console.error('Internal error:', error);
            throw new Error('Failed to process transaction');
        }
    }

    // Calculate collateral requirement for a loan
    async calculateCollateral(borrower: string, loanAmount: number): Promise<{ amount: string, percentage: string }> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            // Convert loan amount to wei (assuming amount is in ETH)
            const loanAmountWei = ethers.parseEther(loanAmount.toString());

            // Call the contract function
            const [amount, percentage] = await this.contract.calculateCollateralRequirement(borrower, loanAmountWei);

            // Store raw values in CollateralRequirement interface
            const requirement: CollateralRequirement = {
                requiredAmount: amount,
                requiredPercentage: percentage
            };

            // Format results for display (percentage is scaled by 1000 in the contract)
            return {
                amount: ethers.formatEther(requirement.requiredAmount),
                percentage: (Number(requirement.requiredPercentage) / 10).toString() + '%'
            };
        } catch (error) {
            console.error('Failed to calculate collateral:', error);
            throw error;
        }
    }

    // Get borrower's credit tier
    async getBorrowerTier(borrower: string): Promise<CreditTier> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const tier = await this.contract.getBorrowerTier(borrower);
            return tier;
        } catch (error) {
            console.error('Failed to get borrower tier:', error);
            throw error;
        }
    }

    async getAccount(): Promise<string | null> {
        const signer = this.walletService.getSigner();
        if (!signer) return null;
        return await signer.getAddress();
    }
}

export const contractService = new ContractService();