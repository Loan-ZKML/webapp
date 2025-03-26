'use client';
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

const WalletConnect = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [address, setAddress] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not found');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            }) as string[];

            if (accounts?.[0]) {
                setAddress(accounts[0]);
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="mb-8">
            {!address ? (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                    <Wallet size={20} />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-2">
                        <Wallet className="text-indigo-600" size={20} />
                        <span className="text-indigo-900 font-medium">Connected</span>
                    </div>
                    <code className="text-sm text-purple-600 bg-white/50 px-3 py-1 rounded-lg">
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </code>
                </div>
            )}
        </div>
    );
};

export default WalletConnect;
