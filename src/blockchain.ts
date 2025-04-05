import { Block, Transaction } from './types';
import crypto from 'crypto';
import { LLMAnalytics } from './llmIntegration';

export class Blockchain {
    private chain: Block[];
    private pendingTransactions: Transaction[];
    private difficulty: number;
    private llm: LLMAnalytics;

    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 2;
        this.llm = new LLMAnalytics();
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
        this.pendingTransactions.push(transaction);
        this.llm.logTransaction(transaction);
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
