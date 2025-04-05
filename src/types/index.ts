export interface Transaction {
    id: string;
    sender: string;
    recipient: string;
    amount: number;
    timestamp: number;
    signature: string;
    status: 'pending' | 'confirmed' | 'failed';
    fee: number;
    data?: any; // Additional metadata for LLM integration
}

export interface Block {
    index: number;
    timestamp: number;
    transactions: Transaction[];
    previousHash: string;
    hash: string;
    nonce: number;
    difficulty: number;
    validator: string;
}

export interface Wallet {
    address: string;
    publicKey: string;
    privateKey?: string; // Optional for security
    balance: number;
    nonce: number;
}

export interface LLMContext {
    prompt: string;
    response: string;
    model: string;
    tokensUsed: number;
    cost: number;
    timestamp: number;
    blockchainContext?: {
        blockIndex: number;
        transactionId?: string;
    };
}

export interface OntiBlockConfig {
    networkId: string;
    consensus: 'poa' | 'pos' | 'ai-consensus';
    blockTime: number;
    token: {
        name: string;
        symbol: string;
        decimals: number;
        totalSupply: number;
        presaleAllocation: number;
        liquidityAllocation: number;
    };
    llm: {
        enabled: boolean;
        defaultModel: string;
        costPerToken: number;
        features: {
            analytics: boolean;
            predictions: boolean;
            smartContractAnalysis: boolean;
            userInsights: boolean;
        };
    };
    smartContracts: {
        enabled: boolean;
        executionCost: number;
        llmVerification: boolean;
    };
}

export interface SmartContract {
    id: string;
    code: string;
    creator: string;
    timestamp: number;
    state: Record<string, any>;
    llmVerified?: boolean;
}

export interface AIPrediction {
    id: string;
    predictionType: 'market' | 'network' | 'token';
    data: any;
    confidence: number;
    timestamp: number;
    expiry: number;
}

export interface UserInsight {
    userId: string;
    insights: {
        portfolioRecommendations?: string[];
        riskAnalysis?: string;
        marketTrends?: string;
    };
    timestamp: number;
}
