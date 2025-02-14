export interface Product {
    id: string;
    name: string;
    type: ProductType;
    price: number;
    stock: number;
    minimumQty: number;
  }
  
  export type ProductType = 'FIFTY_KG' | 'TWENTY_FIVE_KG' | 'FIVE_KG' | 'PER_KILO' | 'GANTANG';