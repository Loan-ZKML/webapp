export interface ParsedProofData {
    proof: Uint8Array;
    publicInputs: number[];
}

export interface ProofFileData {
    bytes: Uint8Array;
    hexString: string;
}

export interface ProofValidationResult {
    isValid: boolean;
    error?: string;
    data?: ParsedProofData;
} 