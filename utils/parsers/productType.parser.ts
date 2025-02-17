export type ProductType =
  | "FIFTY_KG"
  | "TWENTY_FIVE_KG"
  | "FIVE_KG"
  | "PER_KILO"
  | "GANTANG"
  | "SPECIAL_PRICE";

export const parseProductType = (productType: string): string => {
  switch (productType) {
    case "FIFTY_KG":
      return "50kg";
    case "TWENTY_FIVE_KG":
      return "25kg";
    case "FIVE_KG":
      return "5kg";
    case "PER_KILO":
      return "/ kilo";
    case "GANTANG":
      return "/ gantang";
    case "SPECIAL_PRICE":
      return "Special Price";
    default:
      return "Unknown Quantity";
  }
};
