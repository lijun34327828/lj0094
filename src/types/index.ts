export type ModelType = '8874' | '3874';

export interface Product {
  id: string;
  name: string;
  model: ModelType;
  cost: number;
  price: number;
  stockLimit: number;
  turnoverWeight: number;
}

export interface Constraints {
  minTurnoverWeight: number;
  minComboSize: number;
  maxComboSize: number;
  globalStockLimit: number;
  grossProfitWeight: number;
  profitMarginWeight: number;
  avgTurnoverWeight: number;
  monthlyTurnoverWeight: number;
  stockUtilizationWeight: number;
}

export interface ComboItem {
  product: Product;
  quantity: number;
}

export interface ComboResult {
  id: string;
  rank: number;
  items: ComboItem[];
  totalCost: number;
  totalRevenue: number;
  grossProfit: number;
  profitMargin: number;
  weightedScore: number;
  monthlyTurnover: number;
  avgTurnoverWeight: number;
  totalStock: number;
}

export interface CalculationSummary {
  totalCombinations: number;
  filteredByStock: number;
  filteredByWeight: number;
  validCombinations: number;
  calculateTimeMs: number;
}

export interface AppState {
  products: Product[];
  activeModel: ModelType;
  constraints: Record<ModelType, Constraints>;
  results: ComboResult[];
  summary: CalculationSummary | null;
  isCalculating: boolean;
}
