class Cryptocurrency {
    constructor(name, symbol, initialSupply) {
        this.name = name;
        this.symbol = symbol;
        this.totalSupply = initialSupply;
        this.balances = new Map();
    }

    createWallet(address) {
        if (!this.balances.has(address)) {
            this.balances.set(address, 0);
        }
    }

    transfer(from, to, amount) {
        if (this.balances.get(from) >= amount) {
            this.balances.set(from, this.balances.get(from) - amount);
            this.balances.set(to, (this.balances.get(to) || 0) + amount);
        } else {
            throw new Error("Insufficient balance");
        }
    }

    mint(address, amount) {
        this.balances.set(address, (this.balances.get(address) || 0) + amount);
        this.totalSupply += amount;
    }

    getBalance(address) {
        return this.balances.get(address) || 0;
    }
}

module.exports = Cryptocurrency;
