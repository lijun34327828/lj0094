import { useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useDebounce } from '@/hooks/useDebounce';
import { calculateCombinations } from '@/utils/calculator';
import MainLayout from '@/components/layout/MainLayout';
import ProductForm from '@/components/product/ProductForm';
import ProductList from '@/components/product/ProductList';
import ConstraintsPanel from '@/components/constraints/ConstraintsPanel';
import SummaryCard from '@/components/results/SummaryCard';
import RankingList from '@/components/results/RankingList';

export default function HomePage() {
  const {
    products,
    activeModel,
    constraints,
    setResults,
    setIsCalculating,
    getProductsByModel,
  } = useAppStore();

  const modelProducts = useMemo(
    () => getProductsByModel(activeModel),
    [products, activeModel]
  );
  const modelConstraints = constraints[activeModel];

  const debouncedProducts = useDebounce(modelProducts, 280);
  const debouncedConstraints = useDebounce(modelConstraints, 280);

  const calcRef = useRef<number | null>(null);

  useEffect(() => {
    if (calcRef.current) window.clearTimeout(calcRef.current);

    if (debouncedProducts.length < modelConstraints.minComboSize) {
      setResults([], null);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);

    calcRef.current = window.setTimeout(() => {
      try {
        const { results, summary } = calculateCombinations(
          debouncedProducts,
          debouncedConstraints
        );
        setResults(results, summary);
      } finally {
        setIsCalculating(false);
      }
    }, 150);

    return () => {
      if (calcRef.current) window.clearTimeout(calcRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProducts, debouncedConstraints]);

  const leftPanel = (
    <>
      <ProductForm />
      <ConstraintsPanel />
      <ProductList />
    </>
  );

  const rightPanel = (
    <div className="sticky top-24 space-y-0">
      <SummaryCard />
      <RankingList />
    </div>
  );

  return <MainLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
}
