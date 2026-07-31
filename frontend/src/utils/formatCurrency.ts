export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  // Use Intl.NumberFormat for locale-aware formatting; fallback to simple formatting if Intl not available.
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD', // placeholder, will be replaced by symbol manually
      minimumFractionDigits: 2,
    });
    const formatted = formatter.format(amount);
    const firstDigitIndex = formatted.search(/\d/);
    if (firstDigitIndex > 0) {
      return currencySymbol + formatted.slice(firstDigitIndex);
    }
    return formatted;
  } catch (e) {
    // Fallback simple formatting
    return `${currencySymbol}${amount.toFixed(2)}`;
  }
}
