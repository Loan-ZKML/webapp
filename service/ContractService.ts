'use client'; // must render client-side

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers"; // supports legacy provider interfaces and EIP-1193
import { CreditApplicant } from '@/types/zkml';
import { CreditTier, CollateralRequirement } from '@/types/contract'
import { LOAN_MANAGER_ABI } from './abi/CreditScoreLoanManager';

const CONTRACT_ADDRESS = '0x4ebEA61E6a2E4e9E4EcCC84711f001a13';
const ANVIL_CHAIN_ID = 31337; // standard chain ID for Anvil

// Service for interacting with the smart contract
export class ContractService {
    private provider: ethers.BrowserProvider | null = null; // connects to the network
    private contract: ethers.Contract | null = null; // the deployed contract
    private signer: ethers.Signer | null = null; // the user's account
    private readonly chainId = ANVIL_CHAIN_ID;
    private connecting: boolean = false; // Add this line

    constructor() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.handleAccountChange = this.handleAccountChange.bind(this);
            this.handleChainChange = this.handleChainChange.bind(this);
            this.handleDisconnect = this.handleDisconnect.bind(this);

            window.ethereum.on('accountsChanged', this.handleAccountChange);
            window.ethereum.on('chainChanged', this.handleChainChange);
            window.ethereum.on('disconnect', this.handleDisconnect);
        }
    }

    private async handleAccountChange() {
        console.log("Account changed, reconnecting...");
        this.resetState();
        await this.connect();
    }

    private async handleChainChange() {
        console.log("Chain changed, reconnecting...");
        if (!window.ethereum) return;
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.validateNetwork();
    }

    private handleDisconnect() {
        this.resetState();
    }

    private resetState() {
        this.provider = null;
        this.contract = null;
        this.signer = null;
    }

    private isValidProvider(): boolean {
        return (
            window.ethereum?.isMetaMask === true &&
            typeof window.ethereum?.request === 'function'
        );
    }

    // Initialize the connection to the contract
    async connect(): Promise<boolean> {
        if (this.connecting) {
            return false; // Already attempting to connect
        }

        if (typeof window === 'undefined' || !window.ethereum) {
            console.error('Ethereum provider not available. Please install MetaMask.');
            return false;
        }

        if (!this.isValidProvider()) {
            console.error('Invalid or potentially malicious provider detected');
            return false;
        }

        try {
            this.connecting = true;
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            }) as string[];

            if (!accounts?.length) {
                console.error('No accounts available');
                return false;
            }

            this.provider = new ethers.BrowserProvider(window.ethereum);

            if (!await this.validateNetwork()) {
                console.error('Please connect to the correct network');
                return false;
            }

            this.signer = await this.provider.getSigner();
            this.contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                LOAN_MANAGER_ABI,
                this.signer
            );

            if (!ethers.isAddress(CONTRACT_ADDRESS)) {
                throw new Error('Invalid contract address');
            }

            // TODO below needed?
            const message = `Connect to ZKML Credit Score App\nNonce: ${Date.now()}`;
            const signature = await this.signer.signMessage(message);
            // Verify signature matches signer's address
            const recoveredAddress = ethers.verifyMessage(message, signature);
            const signerAddress = await this.signer.getAddress();

            if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
                throw new Error('Invalid signature');
            }

            return true;
        } catch (error: any) {
            console.error('Failed to connect:', error?.message || error);
            return false;
        } finally {
            this.connecting = false;
        }
    }

    // TODO needed?
    // Get the current connected account
    async getAccount(): Promise<string | null> {
        if (!this.signer) {
            return null;
        }

        try {
            return await this.signer.getAddress();
        } catch (error) {
            console.error('Failed to get account:', error);
            return null;
        }
    }

    // Submit a credit score proof to the contract
    async submitProof(proof: Uint8Array, publicInputs: number[]): Promise<boolean> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            // Convert proof to bytes format expected by the contract
            const proofBytes = ethers.hexlify(proof);

            // Convert inputs to bigint array
            const inputs = publicInputs.map(input => BigInt(input));

            // Submit proof to the contract
            const tx = await this.contract.submitCreditScoreProof(proofBytes, inputs);

            // Wait for transaction to be mined
            const receipt = await tx.wait(2);

            if (receipt.status !== 1) {
                throw new Error('Transaction failed');
            }

            return true;
        } catch (error) {
            console.error('Internal error:', error); // log full error internally
            throw new Error('Failed to process transaction'); // sanitized message to user
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

    // TODO call EZKL's prover based on **correct** applicantData. 
    async generateProof(applicantData: CreditApplicant): Promise<{ proof: Uint8Array, publicInputs: number[] }> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // dummy proof
        const proof = new Uint8Array(128).fill(0);

        // dummy public inputs 
        const publicInputs = [123456];

        return {
            proof,
            publicInputs
        };
    }

    private async validateNetwork(): Promise<boolean> {
        if (!this.provider) return false;

        const network = await this.provider.getNetwork();
        const currentChainId = Number(network.chainId);

        if (process.env.NODE_ENV === 'development' && currentChainId === this.chainId) {
            return true;
        }

        if (currentChainId !== this.chainId) {
            try {
                await window.ethereum?.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${this.chainId.toString(16)}` }],
                });
                return true;
            } catch (error: any) {
                if (error.code === 4902) {
                    console.error('Network not added to wallet');
                }
                return false;
            }
        }

        return true;
    }
}

export const contractService = new ContractService();