/// <reference types="jest" />
import { ContractService } from '@/service/ContractService';
import { ethers } from 'ethers';
import { CreditTier } from '@/types/contract';


// Mock ethers
jest.mock('ethers', () => {
    const mockEthers = {
        Contract: jest.fn(),
        BrowserProvider: jest.fn(),
        isAddress: jest.fn(),
        verifyMessage: jest.fn(),
        parseEther: jest.fn(),
        formatEther: jest.fn(),
        hexlify: jest.fn()
    };
    return mockEthers;
});

describe('ContractService', () => {
    let contractService: ContractService;
    let mockProvider: jest.Mock;
    let mockContract: jest.Mock;
    let mockSigner: jest.Mock;
    let mockRequest: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock window.ethereum
        mockRequest = jest.fn();
        global.window = {
            ethereum: {
                isMetaMask: true,
                request: mockRequest,
                on: jest.fn(),
            } as any,
        } as any;

        // Setup mocks
        mockSigner = jest.fn().mockImplementation(() => ({
            getAddress: jest.fn().mockResolvedValue('0x123'),
            signMessage: jest.fn().mockResolvedValue('mockSignature'),
        }));

        mockContract = jest.fn().mockImplementation(() => ({
            submitCreditScoreProof: jest.fn(),
            calculateCollateralRequirement: jest.fn(),
            getBorrowerTier: jest.fn(),
        }));

        mockProvider = jest.fn().mockImplementation(() => ({
            getSigner: jest.fn().mockResolvedValue(mockSigner()),
            getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(11155111) }),
        }));

        // Update the mocked ethers object
        const mockedEthers = require('ethers');
        mockedEthers.BrowserProvider = mockProvider;
        mockedEthers.Contract = mockContract;
        mockedEthers.isAddress.mockReturnValue(true);
        mockedEthers.verifyMessage.mockReturnValue('0x123');
        mockedEthers.hexlify.mockReturnValue('0x123456');
        mockedEthers.parseEther.mockReturnValue(BigInt(1000000000000000000));
        mockedEthers.formatEther.mockReturnValue('1.0');

        // Set a valid contract address for testing
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = '0x123456789';

        contractService = new ContractService();
    });

    describe('connect', () => {
        it('should fail if ethereum provider is not available', async () => {
            // Remove ethereum provider
            global.window.ethereum = undefined;
            const result = await contractService.connect();
            expect(result).toBe(false);
        });

        it('should fail if provider is not MetaMask', async () => {
            global.window.ethereum = {
                isMetaMask: false,
                request: mockRequest,
                on: jest.fn(),
            } as any;
            const result = await contractService.connect();
            expect(result).toBe(false);
        });

        it('should fail if no accounts are available', async () => {
            mockRequest.mockResolvedValueOnce([]);
            const result = await contractService.connect();
            expect(result).toBe(false);
        });

        it('should fail if wrong network', async () => {
            mockRequest.mockResolvedValueOnce(['0x123']);
            // Mock wrong network
            mockProvider.mockImplementation(() => ({
                getSigner: jest.fn().mockResolvedValue(mockSigner()),
                getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(1) }), // mainnet instead of sepolia
            }));

            const result = await contractService.connect();
            expect(result).toBe(false);
        });

        it('should fail if already connecting', async () => {
            // Trigger a connection attempt that hasn't completed
            const firstAttempt = contractService.connect();
            // Try to connect again while first attempt is pending
            const result = await contractService.connect();
            expect(result).toBe(false);
            // Clean up first attempt
            await firstAttempt;
        });
    });

    describe('submitProof', () => {
        const mockProof = new Uint8Array([1, 2, 3]);
        const mockPublicInputs = [123456];

        it('should throw error if contract is not initialized', async () => {
            await expect(contractService.submitProof(mockProof, mockPublicInputs))
                .rejects
                .toThrow('Contract not initialized');
        });

        // TODO: Add tests for initialized contract once contract deployment is complete
        // - Test successful proof submission
        // - Test transaction failure
        // - Test transaction revert
    });

    describe('calculateCollateral', () => {
        it('should throw error if contract is not initialized', async () => {
            await expect(contractService.calculateCollateral('0x123', 5))
                .rejects
                .toThrow('Contract not initialized');
        });

        // TODO: Add tests for initialized contract once contract deployment is complete
        // - Test successful collateral calculation
        // - Test calculation failure
    });

    describe('getBorrowerTier', () => {
        it('should throw error if contract is not initialized', async () => {
            await expect(contractService.getBorrowerTier('0x123'))
                .rejects
                .toThrow('Contract not initialized');
        });

        // TODO: Add tests for initialized contract once contract deployment is complete
        // - Test successful tier retrieval
        // - Test tier lookup failure
    });
}); 