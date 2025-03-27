# zkML Credit Loan Application

A decentralized application that enables privacy-preserving credit score verification using zero-knowledge proofs and machine learning.

## Overview

This application allows users to:

- Submit loan requests with private credit information
- Generate zero-knowledge proofs of creditworthiness
- Verify credit scores without revealing sensitive data
- Interact with smart contracts on the Sepolia testnet

## Tech Stack

- **Frontend**: Next.js 15.2, React 19, TypeScript
- **Styling**: TailwindCSS
- **Blockchain**:
  - Ethers.js 6.13
  - MetaMask integration
  - Sepolia testnet
- **Testing**: Jest with React Testing Library

## Project Structure

```
.
├── LICENSE
├── README.md
├── __tests__
│   └── services
├── app
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── request
│   └── verify
├── components: TODO
├── package-lock.json
├── package.json
├── public
├── service
│   ├── ContractService.ts
│   └── abi
│       └── CreditScoreLoanManager.ts
├── tsconfig.json
├── types
│   ├── contract.ts
│   └── zkml.ts
└── utils
```

## Prerequisites

- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd webapp
```

2. Install dependencies:

```bash
npm install
```


## Development

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test               # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
