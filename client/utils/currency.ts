export const SUPPORTED_CURRENCIES = [
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound Sterling' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'ETB', name: 'Ethiopian Birr' },
];

export const formatCurrency = (amount: number, currencyCode: string): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    } catch (error) {
        // Fallback for unsupported currency codes
        console.warn(`Unsupported currency code: ${currencyCode}. Falling back to default formatting.`);
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};