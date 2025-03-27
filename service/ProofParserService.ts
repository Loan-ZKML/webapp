import { ParsedProofData, ProofFileData, ProofValidationResult } from '../types/proof';

export class ProofParserService {
    async readBinaryFile(file: File): Promise<ProofFileData> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const hexString = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log(`Read ${bytes.length} bytes from ${file.name}`);
            return { bytes, hexString };
        } catch (error) {
            console.error('File read error:', error);
            throw new Error('Failed to read file. Please try again.');
        }
    }

    validateAndParse(data: string): ProofValidationResult {
        try {
            const parsedData = this.parseCalldata(data);
            if (!parsedData) {
                return { isValid: false, error: 'Failed to parse calldata' };
            }

            if (parsedData.proof.length === 0) {
                return { isValid: false, error: 'Invalid proof: empty proof data' };
            }

            return { isValid: true, data: parsedData };
        } catch (error) {
            return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    private parseCalldata(data: string): ParsedProofData | null {
        if (typeof data === 'string' && data.startsWith('0x')) {
            return this.parseEZKLCalldata(data);
        }

        try {
            const jsonData = JSON.parse(data);
            if (jsonData.proof && Array.isArray(jsonData.publicInputs)) {
                return this.parseSimpleFormat(jsonData);
            }
        } catch (e) {
            console.error('Failed to parse JSON data:', e);
        }

        return null;
    }

    private parseSimpleFormat(jsonData: any): ParsedProofData {
        let proofData: Uint8Array;
        if (typeof jsonData.proof === 'string') {
            if (jsonData.proof.startsWith('0x')) {
                const hexString = jsonData.proof.slice(2);
                proofData = new Uint8Array(hexString.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []);
            } else {
                proofData = new TextEncoder().encode(jsonData.proof);
            }
        } else if (Array.isArray(jsonData.proof)) {
            proofData = new Uint8Array(jsonData.proof);
        } else {
            throw new Error('Unsupported proof format');
        }

        return {
            proof: proofData,
            publicInputs: jsonData.publicInputs.map(Number)
        };
    }

    private parseEZKLCalldata(hexData: string): ParsedProofData {
        const hexString = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
        const bytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []);

        // Extract and validate function selector
        const selector = bytes.slice(0, 4);
        const selectorHex = Array.from(selector).map(b => b.toString(16).padStart(2, '0')).join('');
        if (selectorHex !== '1e8e1e13') {
            throw new Error(`Invalid function selector: expected 0x1e8e1e13, got 0x${selectorHex}`);
        }

        // Extract proof data
        const proofOffset = this.readUint32(bytes, 4);
        const proofLengthPos = 4 + proofOffset;
        const proofLength = this.readUint32(bytes, proofLengthPos);
        const proofData = bytes.slice(proofLengthPos + 32, proofLengthPos + 32 + proofLength);

        // Extract public inputs
        const inputsOffset = this.readUint32(bytes, 36);
        const inputsLengthPos = 4 + inputsOffset;
        const inputsLength = this.readUint32(bytes, inputsLengthPos);
        const publicInputs = this.extractPublicInputs(bytes, inputsLengthPos, inputsLength);

        return { proof: proofData, publicInputs };
    }

    private readUint32(bytes: Uint8Array, offset: number): number {
        let value = 0;
        for (let i = 28; i < 32; i++) {
            value = (value << 8) | bytes[offset + i];
        }
        return value;
    }

    private extractPublicInputs(bytes: Uint8Array, startPos: number, length: number): number[] {
        const inputs: number[] = [];
        for (let i = 0; i < length; i++) {
            const pos = startPos + 32 + (i * 32);
            if (pos + 32 <= bytes.length) {
                const inputBytes = bytes.slice(pos, pos + 32);
                const hexValue = '0x' + Array.from(inputBytes).map(b => b.toString(16).padStart(2, '0')).join('');
                const bigValue = BigInt(hexValue);

                if (bigValue <= BigInt(Number.MAX_SAFE_INTEGER)) {
                    inputs.push(Number(bigValue));
                } else {
                    console.warn('Public input too large for Number, using approximate value');
                    inputs.push(Number(bigValue));
                }
            }
        }
        return inputs;
    }
}