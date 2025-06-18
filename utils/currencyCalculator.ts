// Alternative: Using decimal.js for precise calculations
// Install: npm install decimal.js
// Install types: npm install @types/decimal.js

import Decimal from 'decimal.js';

/**
 * Safe currency calculations using decimal.js
 */
export class CurrencyCalculator {
  /**
   * Add two currency amounts safely
   */
  static add(amount1: number, amount2: number): number {
    return new Decimal(amount1).plus(new Decimal(amount2)).toNumber();
  }

  /**
   * Multiply currency by quantity safely
   */
  static multiply(amount: number, quantity: number): number {
    return new Decimal(amount).times(new Decimal(quantity)).toNumber();
  }

  /**
   * Subtract two currency amounts safely
   */
  static subtract(amount1: number, amount2: number): number {
    return new Decimal(amount1).minus(new Decimal(amount2)).toNumber();
  }

  /**
   * Divide currency amount safely
   */
  static divide(amount: number, divisor: number): number {
    return new Decimal(amount).dividedBy(new Decimal(divisor)).toNumber();
  }

  /**
   * Round to 2 decimal places safely
   */
  static round(amount: number): number {
    return new Decimal(amount).toDecimalPlaces(2).toNumber();
  }

  /**
   * Format for display
   */
  static format(amount: number): string {
    return new Decimal(amount).toFixed(2);
  }

  /**
   * Calculate total profit safely
   */
  static calculateTotalProfit(price: number, cost: number, quantity: number): number {
    const profit = new Decimal(price).minus(new Decimal(cost));
    return profit.times(new Decimal(quantity)).toDecimalPlaces(2).toNumber();
  }
}

// Usage example:
// const total = CurrencyCalculator.multiply(profit, quantity);
// const formattedTotal = CurrencyCalculator.format(total);
