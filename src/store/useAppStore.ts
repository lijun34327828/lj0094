import { create } from 'zustand';
import type { AppState, Product, Constraints, ModelType, ComboResult, CalculationSummary, ParetoPoint, SensitivityResult, MultiSensitivityResult } from '@/types';
import { initialProducts, defaultConstraints } from '@/data/mockData';
import { generateId } from '@/utils/formatters';

export const useAppStore = create<AppState & {
  setActiveModel: (model: ModelType) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  updateConstraints: (model: ModelType, patch: Partial<Constraints>) => void;
  setCalcResult: (results: ComboResult[], allResults: ComboResult[], paretoFront: ParetoPoint[], summary: CalculationSummary | null) => void;
  setSensitivityData: (data: SensitivityResult | null) => void;
  setMultiSensitivityData: (data: MultiSensitivityResult | null) => void;
  setSelectedComboId: (id: string | null) => void;
  setIsCalculating: (v: boolean) => void;
  setIsSensitivityCalculating: (v: boolean) => void;
  getProductsByModel: (model: ModelType) => Product[];
  resetAll: () => void;
}>((set, get) => ({
  products: initialProducts,
  activeModel: '8874',
  constraints: defaultConstraints,
  results: [],
  allResults: [],
  paretoFront: [],
  sensitivityData: null,
  multiSensitivityData: null,
  selectedComboId: null,
  summary: null,
  isCalculating: false,
  isSensitivityCalculating: false,

  setActiveModel: (model) => set({
    activeModel: model,
    selectedComboId: null,
    sensitivityData: null,
    multiSensitivityData: null,
  }),

  addProduct: (product) => set((s) => ({
    products: [...s.products, { ...product, id: generateId('p') }],
  })),

  updateProduct: (id, patch) => set((s) => ({
    products: s.products.map(p => p.id === id ? { ...p, ...patch } : p),
  })),

  removeProduct: (id) => set((s) => ({
    products: s.products.filter(p => p.id !== id),
  })),

  updateConstraints: (model, patch) => set((s) => ({
    constraints: {
      ...s.constraints,
      [model]: { ...s.constraints[model], ...patch },
    },
  })),

  setCalcResult: (results, allResults, paretoFront, summary) => set({
    results, allResults, paretoFront, summary,
  }),

  setSensitivityData: (data) => set({ sensitivityData: data }),

  setMultiSensitivityData: (data) => set({ multiSensitivityData: data }),

  setSelectedComboId: (id) => set({
    selectedComboId: id,
    sensitivityData: null,
    multiSensitivityData: null,
  }),

  setIsCalculating: (v) => set({ isCalculating: v }),

  setIsSensitivityCalculating: (v) => set({ isSensitivityCalculating: v }),

  getProductsByModel: (model) => get().products.filter(p => p.model === model),

  resetAll: () => set({
    products: initialProducts,
    constraints: defaultConstraints,
    results: [],
    allResults: [],
    paretoFront: [],
    sensitivityData: null,
    multiSensitivityData: null,
    selectedComboId: null,
    summary: null,
  }),
}));
