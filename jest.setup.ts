// Mock global window object
global.window = {
    ethereum: undefined,
} as any;

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    error: jest.fn(),
    log: jest.fn(),
} as any; 