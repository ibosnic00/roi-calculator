export const calculateROI = (
    purchasePrice: number,
    monthlyRent: number,
    additionalCosts: number,
    renovationCosts: number
): number => {
    const annualRent = monthlyRent * 12;
    const totalInvestment = purchasePrice + additionalCosts + renovationCosts;
    return (annualRent / totalInvestment) * 100;
}; 