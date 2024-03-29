"use client";

// Import Stake.js modules
import { NearProtocolService } from "@restake/stake.js-near-protocol";
import { NearSelectorWallet } from "@restake/stake.js-near-selector";

// Import React modules
import { useEffect, useState, FormEvent } from "react";

// Import Wallet Selector modules
import { setupWalletSelector, WalletSelector } from "@near-wallet-selector/core";
import { setupMeteorWallet  } from "@near-wallet-selector/meteor-wallet";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupNightly } from "@near-wallet-selector/nightly";

// Import Wallet Selector Modal UI modules
import { setupModal } from "@near-wallet-selector/modal-ui";
import "@near-wallet-selector/modal-ui/styles.css";

export default function Home() {
    // Wallet Selector
    const [walletSelector, setWalletSelector] = useState<WalletSelector | null>(null);

    // Staking Form
    const [validatorAddress, setValidatorAddress] = useState("");
    const [stakeAmount, setStakeAmount] = useState("");

    // Initialize Wallet Selector on Mainnet
    useEffect(() => {
        const initWalletSelector = async () => {
            const selector = await setupWalletSelector({
                network: "mainnet",
                modules: [setupMeteorWallet(), setupCoin98Wallet(), setupHereWallet(), setupLedger(), setupNightly()],
            });

            setWalletSelector(selector);
        };

        initWalletSelector();
    }, []);

    // Connect Wallet through Modal
    const connectWallet = async () => {
        if (!walletSelector) {
            throw new Error("Wallet selector is not initialized");
        }
        const modal = setupModal(walletSelector, { contractId: "" });

        modal.show();
    };

    // Handle Staking Form Submission
    const handleStake = async (event: FormEvent) => {
        event.preventDefault();
        if (!walletSelector) {
            throw new Error("Wallet selector is not initialized");
        }

        const service = new NearProtocolService();
        const wallet = new NearSelectorWallet(walletSelector);
        const rawTx = await service.tx.buildDepositAndStakeTx(wallet, validatorAddress, Number(stakeAmount));
        await wallet.signAndBroadcast(rawTx);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24">
            { /* Wallet Connection */ }
            <div className="mb-32">
                <button
                    onClick={connectWallet}
                    disabled={!walletSelector}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                Connect Wallet
                </button>
            </div>

            {/* Staking Form */}
            <div className="p-10 shadow-lg rounded-lg">
                <form onSubmit={handleStake} className="space-y-4">
                    <div>
                        <label htmlFor="validatorAddress" className="block text-sm font-medium text-gray-700">
                        Validator Address
                        </label>
                        <input
                            type="text"
                            id="validatorAddress"
                            value={validatorAddress}
                            onChange={(e) => setValidatorAddress(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700">
                        Stake Amount
                        </label>
                        <input
                            type="text"
                            id="stakeAmount"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                    Stake Now
                    </button>
                </form>
            </div>
        </main>
    );
}
