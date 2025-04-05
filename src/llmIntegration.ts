import { Block, Transaction, LLMContext } from './types';

export class LLMAnalytics {
    private apiKey: string;
    private endpoint: string;
    private costTracker: Map<string, number>;

    constructor() {
        this.apiKey = process.env.LLM_API_KEY || '';
        this.endpoint = process.env.LLM_ENDPOINT || 'https://api.ontiblock.ai/llm';
        this.costTracker = new Map();
    }

    public async logBlockCreation(block: Block): Promise<void> {
        const context: LLMContext = {
            prompt: `Analyze new block #${block.index}`,
            model: 'ontiblock-analyzer',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now(),
            blockchainContext: {
                blockIndex: block.index
            }
        };

        try {
            const response = await this.callLLM(context);
            this.costTracker.set(block.hash, response.cost);
        } catch (error) {
            console.error('LLM analysis failed for block:', block.index, error);
        }
    }

    public async logTransaction(tx: Transaction): Promise<void> {
        const context: LLMContext = {
            prompt: `Analyze transaction ${tx.id}`,
            model: 'ontiblock-tx-analyzer',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now(),
            blockchainContext: {
                transactionId: tx.id
            }
        };

        try {
            const response = await this.callLLM(context);
            this.costTracker.set(tx.id, response.cost);
        } catch (error) {
            console.error('LLM analysis failed for transaction:', tx.id, error);
        }
    }

    private async callLLM(context: LLMContext): Promise<{response: string, cost: number}> {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(context)
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            response: data.response,
            cost: data.cost || 0
        };
    }

    public getCostAnalysis(): Map<string, number> {
        return new Map(this.costTracker);
    }
}
