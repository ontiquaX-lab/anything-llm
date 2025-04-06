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

    public predictStakingBonus(amount: number, duration: number): number {
        // LLM predicts bonus based on staking amount and duration
        const prediction = this.callLLM({
            prompt: `Predict staking bonus for ${amount} ONTI for ${duration} days`,
            model: 'ontiblock-staking-predictor',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now()
        });
        return prediction.then(res => parseFloat(res.response) || 0);
    }

    public predictNetworkYield(): number {
        // LLM predicts overall network yield
        const prediction = this.callLLM({
            prompt: 'Predict network yield for next epoch',
            model: 'ontiblock-yield-predictor',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now()
        });
        return prediction.then(res => parseFloat(res.response) || 0.15); // Default 15%
    }

    public getProfitOptimizationSuggestions(): string[] {
        // LLM generates profit optimization strategies
        const suggestions = this.callLLM({
            prompt: 'Suggest profit optimization strategies',
            model: 'ontiblock-profit-optimizer',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now()
        });
        return suggestions.then(res =>
            res.response.split('\n').filter(s => s.trim())
        );
    }

    public logValidatorRegistration(address: string, stakeAmount: number): void {
        this.callLLM({
            prompt: `New validator registered: ${address} with ${stakeAmount} ONTI staked`,
            model: 'ontiblock-validator-tracker',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now()
        });
    }

    public logFeeAdjustment(newBaseFee: number, newPriorityRate: number): void {
        this.callLLM({
            prompt: `Fee adjustment to base=${newBaseFee}, priority=${newPriorityRate}`,
            model: 'ontiblock-fee-analytics',
            tokensUsed: 0,
            cost: 0,
            timestamp: Date.now()
        });
    }

    public getCostAnalysis(): Map<string, number> {
        return new Map(this.costTracker);
    }
