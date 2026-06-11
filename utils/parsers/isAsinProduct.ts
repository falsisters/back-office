export const isAsinProduct = (productName: string): boolean => {
  return productName.toLowerCase().includes("asin");
};

export type AsinType = "ASIN" | "ASIN_50KG" | "ASIN_25KG";
