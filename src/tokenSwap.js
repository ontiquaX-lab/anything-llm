class TokenSwap {
    constructor(tokenA, tokenB, rateAtoB) {
        this.tokenA = tokenA;
        this.tokenB = tokenB;
        this.rateAtoB = rateAtoB; // Number of tokenB units per tokenA
    }

    swap(fromToken, toToken, fromAddress, toAddress, amount) {
        if (fromToken === this.tokenA && toToken === this.tokenB) {
            const toAmount = amount * this.rateAtoB;
            this.tokenA.transfer(fromAddress, toAddress, amount);
            this.tokenB.mint(toAddress, toAmount);
        } else if (fromToken === this.tokenB && toToken === this.tokenA) {
            const toAmount = amount / this.rateAtoB;
            this.tokenB.transfer(fromAddress, toAddress, amount);
            this.tokenA.mint(toAddress, toAmount);
        } else {
            throw new Error("Invalid token pair for swap");
        }
    }
}

module.exports = TokenSwap;
