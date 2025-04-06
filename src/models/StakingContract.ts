export class StakingContract {
    public readonly id: string;
    public readonly validatorAddress: string;
    public readonly amount: number;
    public readonly durationDays: number;
    public readonly createdAt: number;
    public claimedRewards: number;
    public active: boolean;

    constructor(
        id: string,
        validatorAddress: string,
        amount: number,
        durationDays: number
    ) {
        this.id = id;
        this.validatorAddress = validatorAddress;
        this.amount = amount;
        this.durationDays = durationDays;
        this.createdAt = Date.now();
        this.claimedRewards = 0;
        this.active = true;
    }

    public calculateRewards(currentBlockHeight: number): number {
        const elapsedDays = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
        const completionRatio = Math.min(elapsedDays / this.durationDays, 1);

        // Base rewards + bonus for longer durations
        const baseReward = this.amount * 0.15 * completionRatio;
        const durationBonus = this.amount * 0.05 * (this.durationDays / 365);

        return baseReward + durationBonus;
    }

    public canWithdraw(): boolean {
        const elapsedDays = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
        return elapsedDays >= this.durationDays;
    }
}
