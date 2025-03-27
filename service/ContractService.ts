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

const CONTRACT_ADDRESS = '0x4ebEA61E6a2E4e9E4EcCC84711f001a13D6B406C';
const ANVIL_CHAIN_ID = 31337; // standard chain ID for Anvil

export interface ParsedProofData {
    proof: Uint8Array;
    publicInputs: number[];
}

// Service for interacting with the smart contract
export class ContractService {
    private provider: ethers.BrowserProvider | null = null; // connects to the network
    private contract: ethers.Contract | null = null; // the deployed contract
    private signer: ethers.Signer | null = null; // the user's account
    private readonly chainId = ANVIL_CHAIN_ID;
    private connecting: boolean = false;

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

    /**
     * Reads a binary file and returns ArrayBuffer
     * @param file The file to read
     * @returns ArrayBuffer of file content
     */
    async readBinaryFile(file: File): Promise<{ bytes: Uint8Array, hexString: string }> {
        try {
            // Read the file as an ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            // Convert to hex string for internal representation
            const hexString = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

            console.log(`Read ${bytes.length} bytes from ${file.name}`);
            return { bytes, hexString };
        } catch (error) {
            console.error('File read error:', error);
            throw new Error('Failed to read file. Please try again.');
        }
    }

    /**
     * Parses calldata from a string representation
     * @param data String containing proof data (hex or JSON)
     * @returns Parsed proof and public inputs
     */
    parseCalldata(data: string): ParsedProofData | null {
        try {
            // Check if we have a hex string (from our binary file upload)
            if (typeof data === 'string' && data.startsWith('0x')) {
                return this.parseEZKLCalldata(data);
            }

            // As a fallback, try to parse as JSON for direct text pasting
            try {
                const jsonData = JSON.parse(data);

                // Handle various JSON formats that might be pasted
                if (jsonData.proof && Array.isArray(jsonData.publicInputs)) {
                    return this.parseSimpleFormat(jsonData);
                } else if (typeof jsonData === 'string' && jsonData.startsWith('0x')) {
                    return this.parseEZKLCalldata(jsonData);
                } else if (typeof jsonData === 'string') {
                    try {
                        // Handle double-stringified JSON
                        const nestedData = JSON.parse(jsonData);
                        if (nestedData.proof && Array.isArray(nestedData.publicInputs)) {
                            return this.parseSimpleFormat(nestedData);
                        } else if (typeof nestedData === 'string' && nestedData.startsWith('0x')) {
                            return this.parseEZKLCalldata(nestedData);
                        }
                    } catch (e) {
                        // Not a nested JSON, ignore
                    }
                }
            } catch (e) {
                // Not JSON, and not a hex string - we can't parse this
                console.error('Data is neither a hex string nor valid JSON');
            }

            throw new Error('Unrecognized calldata format');
        } catch (error) {
            console.error('Error parsing calldata:', error);
            return null;
        }
    }

    /**
     * Parses simple JSON format with proof and publicInputs properties
     * @param jsonData JSON object with proof and publicInputs
     * @returns Parsed proof data
     */
    private parseSimpleFormat(jsonData: any): ParsedProofData {
        // Convert proof to Uint8Array
        let proofData: Uint8Array;
        if (typeof jsonData.proof === 'string') {
            // Handle hex string
            if (jsonData.proof.startsWith('0x')) {
                const hexString = jsonData.proof.slice(2); // Remove '0x' prefix
                proofData = new Uint8Array(hexString.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []);
            } else {
                // If proof is base64 or another encoding, convert accordingly
                proofData = new TextEncoder().encode(jsonData.proof);
            }
        } else if (Array.isArray(jsonData.proof)) {
            // If proof is already an array of numbers
            proofData = new Uint8Array(jsonData.proof);
        } else {
            throw new Error('Unsupported proof format');
        }

        // Convert public inputs to numbers
        const publicInputs = jsonData.publicInputs.map(Number);

        return {
            proof: proofData,
            publicInputs: publicInputs
        };
    }

    /**
     * Parses EZKL calldata format
     * @param hexData Hex string starting with 0x
     * @returns Parsed proof data
     */
    private parseEZKLCalldata(hexData: string): ParsedProofData {
        // Remove '0x' prefix if present
        const hexString = hexData.startsWith('0x') ? hexData.slice(2) : hexData;

        // Convert hex string to bytes
        const bytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

        console.log(`Parsing binary calldata, total bytes: ${bytes.length}`);

        // Extract function selector (first 4 bytes)
        const selector = bytes.slice(0, 4);
        const selectorHex = Array.from(selector).map(b => b.toString(16).padStart(2, '0')).join('');

        console.log(`Function selector: 0x${selectorHex}`);

        // Check the selector (expected: 0x1e8e1e13 for submitCreditScoreProof)
        if (selectorHex !== '1e8e1e13') {
            console.warn(`Function selector mismatch, expected 0x1e8e1e13, got 0x${selectorHex}`);
        }

        // Extract the proof offset (from bytes 4-36)
        const proofOffsetBytes = bytes.slice(4, 36);
        // Handle big-endian conversion - need to get the value from the last 4 bytes
        let proofOffset = 0;
        for (let i = 28; i < 32; i++) {
            proofOffset = (proofOffset << 8) | proofOffsetBytes[i];
        }

        console.log(`Proof offset: ${proofOffset}`);

        // Calculate the position of the proof length
        const proofLengthPos = 4 + proofOffset;

        // Get the proof length - similarly need to handle big-endian
        const proofLengthBytes = bytes.slice(proofLengthPos, proofLengthPos + 32);
        let proofLength = 0;
        for (let i = 28; i < 32; i++) {
            proofLength = (proofLength << 8) | proofLengthBytes[i];
        }

        console.log(`Proof length: ${proofLength}`);

        // Extract the proof data
        const proofData = bytes.slice(proofLengthPos + 32, proofLengthPos + 32 + proofLength);

        console.log(`Extracted proof data: ${proofData.length} bytes`);

        // Get the offset to the public inputs
        const inputsOffsetBytes = bytes.slice(36, 68);
        let inputsOffset = 0;
        for (let i = 28; i < 32; i++) {
            inputsOffset = (inputsOffset << 8) | inputsOffsetBytes[i];
        }

        console.log(`Inputs offset: ${inputsOffset}`);

        // Calculate the position of inputs length
        const inputsLengthPos = 4 + inputsOffset;

        // Get inputs length
        const inputsLengthBytes = bytes.slice(inputsLengthPos, inputsLengthPos + 32);
        let inputsLength = 0;
        for (let i = 28; i < 32; i++) {
            inputsLength = (inputsLength << 8) | inputsLengthBytes[i];
        }

        console.log(`Number of public inputs: ${inputsLength}`);

        // Extract public inputs
        const publicInputs: number[] = [];
        for (let i = 0; i < inputsLength; i++) {
            const pos = inputsLengthPos + 32 + (i * 32);
            if (pos + 32 <= bytes.length) {
                const inputBytes = bytes.slice(pos, pos + 32);
                // Extract as a BigInt and convert to Number
                try {
                    // Create hex string from the bytes
                    const hexValue = '0x' + Array.from(inputBytes).map(b => b.toString(16).padStart(2, '0')).join('');
                    const bigValue = BigInt(hexValue);

                    // Log the input value
                    console.log(`Public input ${i}: ${bigValue.toString()}`);

                    // Convert to Number if it fits
                    if (bigValue <= BigInt(Number.MAX_SAFE_INTEGER)) {
                        publicInputs.push(Number(bigValue));
                    } else {
                        console.warn('Public input too large for Number, using approximate value');
                        publicInputs.push(Number(bigValue)); // This will be an approximation
                    }
                } catch (e) {
                    console.error(`Error converting input ${i} to number:`, e);
                }
            }
        }

        return {
            proof: proofData,
            publicInputs: publicInputs
        };
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

    // Generate a proof based on applicant data
    async generateProof(applicantData: CreditApplicant): Promise<ParsedProofData> {
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