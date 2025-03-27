import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from "@metamask/providers";

export class WalletService {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.Signer | null = null;
    private connecting: boolean = false;
    private readonly chainId: number;

    constructor(chainId: number) {
        this.chainId = chainId;
        if (typeof window !== 'undefined' && window.ethereum) {
            this.setupEventListeners();
        }
    }

    private setupEventListeners() {
        window.ethereum?.on('accountsChanged', this.handleAccountChange.bind(this));
        window.ethereum?.on('chainChanged', this.handleChainChange.bind(this));
        window.ethereum?.on('disconnect', this.handleDisconnect.bind(this));
    }

    private isValidProvider(): boolean {
        return (
            window.ethereum?.isMetaMask === true &&
            typeof window.ethereum?.request === 'function'
        );
    }

    async connect(): Promise<{ success: boolean; signer?: ethers.Signer }> {
        if (this.connecting) {
            return { success: false };
        }

        if (typeof window === 'undefined' || !window.ethereum) {
            console.error('Ethereum provider not available');
            return { success: false };
        }

        if (!this.isValidProvider()) {
            console.error('Invalid provider detected');
            return { success: false };
        }

        try {
            this.connecting = true;
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            }) as string[];

            if (!accounts?.length) {
                return { success: false };
            }

            this.provider = new ethers.BrowserProvider(window.ethereum);

            if (!await this.validateNetwork()) {
                return { success: false };
            }

            this.signer = await this.provider.getSigner();
            await this.verifySignature();

            return { success: true, signer: this.signer };
        } catch (error) {
            console.error('Connection failed:', error);
            return { success: false };
        } finally {
            this.connecting = false;
        }
    }

    private async verifySignature(): Promise<boolean> {
        if (!this.signer) return false;

        const message = `Connect to Smart Collateral App\nNonce: ${Date.now()}`;
        const signature = await this.signer.signMessage(message);
        const recoveredAddress = ethers.verifyMessage(message, signature);
        const signerAddress = await this.signer.getAddress();

        return recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
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

    // Event handlers
    private async handleAccountChange() {
        this.resetState();
        await this.connect();
    }

    private async handleChainChange() {
        if (!window.ethereum) return;
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.validateNetwork();
    }

    private handleDisconnect() {
        this.resetState();
    }

    private resetState() {
        this.provider = null;
        this.signer = null;
    }

    getProvider(): ethers.BrowserProvider | null {
        return this.provider;
    }

    getSigner(): ethers.Signer | null {
        return this.signer;
    }
} 