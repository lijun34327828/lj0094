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

export type OptimizationStatus = 'optimal' | 'no_feasible' | 'multiple';

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
  optimizationStatus: OptimizationStatus;
  alternateSolutions?: number;
  isParetoOptimal: boolean;
}

export interface ParetoPoint {
  comboId: string;
  rank: number;
  grossProfit: number;
  monthlyTurnover: number;
  stockUtilization: number;
  isPareto: boolean;
  label: string;
}

export interface SensitivityPoint {
  paramValue: number;
  score: number;
  rank: number;
}

export interface SensitivityResult {
  paramName: string;
  paramLabel: string;
  productId: string;
  productName: string;
  baseValue: number;
  minValue: number;
  maxValue: number;
  points: SensitivityPoint[];
  sensitivityCoefficient: number;
}

export interface MultiSensitivityResult {
  comboId: string;
  comboRank: number;
  comboScore: number;
  results: SensitivityResult[];
  mostSensitive: {
    paramName: string;
    paramLabel: string;
    productId: string;
    productName: string;
    coefficient: number;
  } | null;
}

export interface CalculationSummary {
  totalCombinations: number;
  filteredByStock: number;
  filteredByWeight: number;
  validCombinations: number;
  paretoCount: number;
  calculateTimeMs: number;
}

export interface CalcOutput {
  results: ComboResult[];
  allResults: ComboResult[];
  paretoFront: ParetoPoint[];
  summary: CalculationSummary;
}

export type WorkerMessage =
  | { type: 'calculate'; products: Product[]; constraints: Constraints }
  | { type: 'sensitivity'; products: Product[]; constraints: Constraints; comboId: string; paramName: string; productId: string }
  | { type: 'multiSensitivity'; products: Product[]; constraints: Constraints; comboId: string };

export type WorkerResponse =
  | { type: 'calcResult'; output: CalcOutput }
  | { type: 'sensitivityResult'; data: SensitivityResult }
  | { type: 'multiSensitivityResult'; data: MultiSensitivityResult };

export interface AppState {
  products: Product[];
  activeModel: ModelType;
  constraints: Record<ModelType, Constraints>;
  results: ComboResult[];
  allResults: ComboResult[];
  paretoFront: ParetoPoint[];
  sensitivityData: SensitivityResult | null;
  multiSensitivityData: MultiSensitivityResult | null;
  selectedComboId: string | null;
  summary: CalculationSummary | null;
  isCalculating: boolean;
  isSensitivityCalculating: boolean;
}
