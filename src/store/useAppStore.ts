import { create } from 'zustand';
import type { AppState, Product, Constraints, ModelType, ComboResult, CalculationSummary } from '@/types';
import { initialProducts, defaultConstraints } from '@/data/mockData';
import { generateId } from '@/utils/formatters';

export const useAppStore = create<AppState & {
  setActiveModel: (model: ModelType) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  updateConstraints: (model: ModelType, patch: Partial<Constraints>) => void;
  setResults: (results: ComboResult[], summary: CalculationSummary | null) => void;
  setIsCalculating: (v: boolean) => void;
  getProductsByModel: (model: ModelType) => Product[];
  resetAll: () => void;
}>((set, get) => ({
  products: initialProducts,
  activeModel: '8874',
  constraints: defaultConstraints,
  results: [],
  summary: null,
  isCalculating: false,

  setActiveModel: (model) => set({ activeModel: model }),

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

  setResults: (results, summary) => set({ results, summary }),

  setIsCalculating: (v) => set({ isCalculating: v }),

  getProductsByModel: (model) => get().products.filter(p => p.model === model),

  resetAll: () => set({
    products: initialProducts,
    constraints: defaultConstraints,
    results: [],
    summary: null,
  }),
}));
