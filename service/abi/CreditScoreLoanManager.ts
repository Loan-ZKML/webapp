// ABI for the CreditScoreLoanManager smart contract
export const LOAN_MANAGER_ABI = [
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_proof",
                "type": "bytes"
            },
            {
                "internalType": "uint256[]",
                "name": "_publicInputs",
                "type": "uint256[]"
            }
        ],
        "name": "submitCreditScoreProof",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_borrower",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_loanAmount",
                "type": "uint256"
            }
        ],
        "name": "calculateCollateralRequirement",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "percentage",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_borrower",
                "type": "address"
            }
        ],
        "name": "getBorrowerTier",
        "outputs": [
            {
                "internalType": "enum ICollateralCalculator.CreditTier",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; 