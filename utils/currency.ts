// Currency utility functions to handle floating point precision
// Store all monetary values as integers (centavos/cents)

/**
 * Convert peso amount to centavos (multiply by 100)
 * @param pesos - Amount in pesos (can be decimal)
 * @returns Integer representing centavos
 */
export function pesosToBaseCurrency(pesos: number): number {
  return Math.round(pesos * 100);
}

/**
 * Convert centavos back to pesos (divide by 100)
 * @param centavos - Amount in centavos (integer)
 * @returns Amount in pesos (decimal)
 */
export function baseCurrencyToPesos(centavos: number): number {
  return centavos / 100;
}

/**
 * Format currency for display
 * @param centavos - Amount in centavos
 * @returns Formatted peso string
 */
export function formatCurrency(centavos: number): string {
  const pesos = baseCurrencyToPesos(centavos);
  return pesos.toFixed(2);
}

/**
 * Parse user input (in pesos) to centavos
 * @param input - User input string or number
 * @returns Centavos as integer, or 0 if invalid
 */
export function parseInputToCentavos(input: string | number): number {
  const value = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(value)) return 0;
  return pesosToBaseCurrency(value);
}

/**
 * Add two currency amounts safely
 * @param centavos1 - First amount in centavos
 * @param centavos2 - Second amount in centavos
 * @returns Sum in centavos
 */
export function addCurrency(centavos1: number, centavos2: number): number {
  return centavos1 + centavos2;
}

/**
 * Multiply currency by quantity safely
 * @param centavos - Amount in centavos
 * @param quantity - Quantity (can be decimal)
 * @returns Product in centavos
 */
export function multiplyCurrency(centavos: number, quantity: number): number {
  return Math.round(centavos * quantity);
}

/**
 * Calculate percentage of currency amount
 * @param centavos - Base amount in centavos
 * @param percentage - Percentage (e.g., 10 for 10%)
 * @returns Percentage amount in centavos
 */
export function calculatePercentage(centavos: number, percentage: number): number {
  return Math.round(centavos * (percentage / 100));
}
