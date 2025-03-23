/// <reference types="jest" />
import { ContractService } from '@/service/ContractService';
import { ethers } from 'ethers';

// Mock ethers and MetaMask provider
jest.mock('ethers');

describe('ContractService', () => {
    let contractService: ContractService;
    let mockEthereum: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock window.ethereum
        mockEthereum = {
            isMetaMask: true,
            request: jest.fn(),
            on: jest.fn(),
            removeListener: jest.fn(),
        };
        global.window = {
            ethereum: mockEthereum,
        } as any;

        contractService = new ContractService();
    });

    describe('connect', () => {
        it('should return false if ethereum provider is not available', async () => {
            global.window.ethereum = undefined;
            const result = await contractService.connect();
            expect(result).toBe(false);
        });

        it('should return false if provider is not MetaMask', async () => {
            mockEthereum.isMetaMask = false;
            const result = await contractService.connect();
            expect(result).toBe(false);
        });

        it('should handle successful connection', async () => {
            // Mock successful responses
            mockEthereum.request.mockResolvedValueOnce(['0x123']);

            const mockProvider = {
                getNetwork: jest.fn().mockResolvedValue({ chainId: 11155111 }),
            };
            const mockSigner = {
                getAddress: jest.fn().mockResolvedValue('0x123'),
                signMessage: jest.fn().mockResolvedValue('0xsignature'),
            };

            (ethers.BrowserProvider as jest.Mock).mockImplementation(() => mockProvider);
            (ethers.Contract as jest.Mock).mockImplementation(() => ({}));
            (ethers.verifyMessage as jest.Mock).mockReturnValue('0x123');

            const result = await contractService.connect();
            expect(result).toBe(true);
        });
    });

    describe('getAccount', () => {
        it('should return null if no signer is available', async () => {
            const result = await contractService.getAccount();
            expect(result).toBeNull();
        });
    });

    describe('calculateCollateral', () => {
        it('should throw error if contract is not initialized', async () => {
            await expect(contractService.calculateCollateral('0x123', 1))
                .rejects
                .toThrow('Contract not initialized');
        });
    });

    describe('generateProof', () => {
        it('should return dummy proof and inputs', async () => {
            const applicantData = {
                name: 'Test',
                income: 50000,
                employmentYears: 5,
                existingLoans: 0,
                creditScore: 750,
                requestedAmount: 10000,
                purpose: 'Test purpose'
            };

            const result = await contractService.generateProof(applicantData);

            expect(result).toHaveProperty('proof');
            expect(result).toHaveProperty('publicInputs');
            expect(result.proof).toBeInstanceOf(Uint8Array);
            expect(result.proof.length).toBe(128);
            expect(result.publicInputs).toEqual([123456]);
        });
    });

    describe('handleChainChange', () => {
        it('should handle chain changes correctly', async () => {
            const mockProvider = {
                getNetwork: jest.fn().mockResolvedValue({ chainId: 11155111 }),
            };
            (ethers.BrowserProvider as jest.Mock).mockImplementation(() => mockProvider);

            // Trigger chain change
            const chainChangedCallback = mockEthereum.on.mock.calls.find(
                (call: [string, Function]) => call[0] === 'chainChanged'
            )[1];

            await chainChangedCallback();

            expect(ethers.BrowserProvider).toHaveBeenCalled();
        });
    });
}); 