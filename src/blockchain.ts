import { Block, Transaction } from './types';
import crypto from 'crypto';
import { LLMAnalytics } from './llmIntegration';

export class Blockchain {
    private chain: Block[];
    private pendingTransactions: Transaction[];
    private difficulty: number;
    private llm: LLMAnalytics;
    private tokenSupply: number;
    private validators: Map<string, {
        stakedAmount: number;
        activeSince: number;
        lastValidation: number;
        slashed: boolean;
        contracts: StakingContract[];
    }>;

    private stakingContracts: Map<string, StakingContract>;
    private tokenAllocations: {
        presale: number;
        liquidity: number;
        mined: number;
        stakingRewards: number;
        feePool: number;
    };
    private baseFee: number;
    private priorityFeeRate: number;

    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 2;
        this.validators = new Map();
        this.stakingContracts = new Map();
        this.llm = new LLMAnalytics();
        this.tokenSupply = 888880000; // Total ONTI supply
        this.baseFee = 0.001; // Base fee in ONTI
        this.priorityFeeRate = 0.0001; // Priority fee rate
        this.tokenAllocations = {
            presale: 444440000, // 50% for presale
            liquidity: 444440000, // 50% for liquidity
            mined: 0,
            stakingRewards: 0,
            feePool: 0
        };
        this.createGenesisBlock();
    }

    private createGenesisBlock(): void {
        const genesisBlock: Block = {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            nonce: 0,
            previousHash: '0',
            hash: '',
            difficulty: 0,
            validator: 'genesis'
        };
        genesisBlock.hash = this.calculateHash(genesisBlock);
        this.chain.push(genesisBlock);
    }

    private calculateHash(block: Omit<Block, 'hash'>): string {
        return crypto
            .createHash('sha256')
            .update(
                block.index +
                block.timestamp +
                JSON.stringify(block.transactions) +
                block.previousHash +
                block.nonce
            )
            .digest('hex');
    }

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public getChain(): Block[] {
        return [...this.chain];
    }

    public getPendingTransactions(): Transaction[] {
        return [...this.pendingTransactions];
    }

    public minePendingTransactions(validatorAddress: string): void {
        const previousHash = this.getLatestBlock().hash;
        const newBlock: Omit<Block, 'hash'> = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: 0,
            previousHash,
            difficulty: this.difficulty,
            validator: validatorAddress
        };

        let hash = this.calculateHash(newBlock);
        while (!hash.startsWith('0'.repeat(this.difficulty))) {
            newBlock.nonce++;
            hash = this.calculateHash(newBlock);
        }

        const completeBlock: Block = {
            ...newBlock,
            hash
        };

        this.chain.push(completeBlock);
        this.pendingTransactions = [];
        this.llm.logBlockCreation(completeBlock);
    }

    public createTransaction(transaction: Transaction): void {
        if (!this.isValidTransaction(transaction)) {
            throw new Error('Invalid transaction');
        }

        // Calculate dynamic fee
        const fee = this.calculateTransactionFee(transaction);
        transaction.fee = fee;
        this.tokenAllocations.feePool += fee;

        // Apply ONTI token economics rules
        if (transaction.data?.isPresale) {
            if (this.tokenAllocations.presale >= transaction.amount) {
                this.tokenAllocations.presale -= transaction.amount;
            } else {
                throw new Error('Insufficient presale allocation');
            }
        } else if (transaction.data?.isLiquidity) {
            if (this.tokenAllocations.liquidity >= transaction.amount) {
                this.tokenAllocations.liquidity -= transaction.amount;
            } else {
                throw new Error('Insufficient liquidity allocation');
            }
        }

        this.pendingTransactions.push(transaction);
        this.llm.logTransaction(transaction);
    }

    private calculateTransactionFee(tx: Transaction): number {
        // Base fee + (priority fee * tx size)
        const sizeFactor = JSON.stringify(tx).length / 1000; // Normalize by KB
        return this.baseFee + (this.priorityFeeRate * sizeFactor);
    }

    public distributeFees(validatorAddress: string): void {
        // Distribute 80% to validator, 20% burned
        const validatorReward = this.tokenAllocations.feePool * 0.8;
        this.createTransaction({
            sender: 'fee_pool',
            recipient: validatorAddress,
            amount: validatorReward,
            timestamp: Date.now()
        });
        this.tokenSupply -= this.tokenAllocations.feePool * 0.2; // Burn 20%
        this.tokenAllocations.feePool = 0;
    }

    public registerValidator(address: string, stakeAmount: number): void {
        if (stakeAmount < 10000) {
            throw new Error('Minimum stake amount is 10,000 ONTI');
        }

        this.validators.set(address, {
            stakedAmount: stakeAmount,
            activeSince: Date.now(),
            lastValidation: 0,
            slashed: false
        });

        this.llm.logValidatorRegistration(address, stakeAmount);
    }

    public createStakingContract(
        validatorAddress: string,
        amount: number,
        durationDays: number
    ): string {
        if (!this.validators.has(validatorAddress)) {
            throw new Error('Validator not registered');
        }

        const contractId = `stake-${Date.now()}-${validatorAddress}`;
        const contract = new StakingContract(
            contractId,
            validatorAddress,
            amount,
            durationDays
        );

        this.stakingContracts.set(contractId, contract);

        const validator = this.validators.get(validatorAddress);
        if (validator) {
            validator.contracts.push(contract);
            validator.stakedAmount += amount;
        }

        this.llm.logStakingContractCreation(contractId, validatorAddress, amount, durationDays);
        return contractId;
    }

    public distributeRewards(blockHeight: number): void {
        // Distribute to all active validators
        this.validators.forEach((validator, address) => {
            if (validator.slashed) return;

            let totalRewards = 0;

            // Calculate rewards for each staking contract
            validator.contracts.forEach(contract => {
                if (contract.active) {
                    const rewards = contract.calculateRewards(blockHeight);
                    totalRewards += rewards;
                    contract.claimedRewards += rewards;
                }
            });

            // Create reward transaction
            if (totalRewards > 0) {
                this.createTransaction({
                    sender: 'staking_rewards',
                    recipient: address,
                    amount: totalRewards,
                    timestamp: Date.now(),
                    data: {
                        isReward: true,
                        blockHeight
                    }
                });
            }

            validator.lastValidation = Date.now();
        });

        this.llm.logRewardDistribution(blockHeight);
    }

    public getValidatorInfo(address: string): {
        activeSince: number;
        lastValidation: number;
        slashed: boolean;
        contracts: StakingContract[];
    } | undefined {
        return this.validators.get(address);
    }
    public getTokenEconomics(): {
        totalSupply: number;
        allocations: {
            presale: number;
            liquidity: number;
            mined: number;
            stakingRewards: number;
            feePool: number;
        };
        currentFees: {
            baseFee: number;
            priorityFeeRate: number;
        };
    } {
        return {
            totalSupply: this.tokenSupply,
            allocations: { ...this.tokenAllocations },
            currentFees: {
                baseFee: this.baseFee,
                priorityFeeRate: this.priorityFeeRate
            }
        };
    }
    private isValidTransaction(tx: Transaction): boolean {
        return (
            tx.sender &&
            tx.recipient &&
            tx.amount > 0 &&
            tx.timestamp <= Date.now() &&
            this.verifySignature(tx)
        );
    }

    private verifySignature(tx: Transaction): boolean {
        // Implementation would verify the cryptographic signature
        return true; // Placeholder
    }
