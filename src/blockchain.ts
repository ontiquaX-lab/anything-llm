import { Block } from './types';

export class Blockchain {
    private chain: Block[];

    constructor() {
        this.chain = [];
        this.createGenesisBlock();
    }

    private createGenesisBlock() {
        const genesisBlock: Block = {
            index: 0,
            timestamp: Date.now(),
            data: "Genesis Block",
            previousHash: "0",
            hash: this.calculateHash(0, Date.now(), "Genesis Block", "0"),
        };
        this.chain.push(genesisBlock);
    }

    private calculateHash(index: number, timestamp: number, data: string, previousHash: string): string {
        return `${index}${timestamp}${data}${previousHash}`; // Simplified hash for now
    }

    public getChain() {
        return this.chain;
    }
}
