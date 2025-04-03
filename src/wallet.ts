import { Transaction } from './transaction';

export class Wallet {
    public balance: number;

    constructor(public address: string) {
        this.balance = 0;
    }

    public createTransaction(receiver: string, amount: number): Transaction {
        if (amount > this.balance) {
            throw new Error("Insufficient balance");
        }
        this.balance -= amount;
        return new Transaction(this.address, receiver, amount);
    }
}
