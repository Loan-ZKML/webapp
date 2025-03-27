export enum CreditTier {
    UNKNOWN = 0,
    FAVORABLE = 1
}

export interface CollateralRequirement {
    requiredAmount: bigint;
    requiredPercentage: bigint;
}
