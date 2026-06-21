import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useDebounce } from '@/hooks/useDebounce';
import MainLayout from '@/components/layout/MainLayout';
import ProductForm from '@/components/product/ProductForm';
import ProductList from '@/components/product/ProductList';
import ConstraintsPanel from '@/components/constraints/ConstraintsPanel';
import SummaryCard from '@/components/results/SummaryCard';
import RankingList from '@/components/results/RankingList';
import AnalysisPanel from '@/components/results/AnalysisPanel';
import type { WorkerMessage } from '@/types';

export default function HomePage() {
  const {
    products,
    activeModel,
    constraints,
    setCalcResult,
    setIsCalculating,
    getProductsByModel,
  } = useAppStore();

  const modelProducts = useMemo(
    () => getProductsByModel(activeModel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, activeModel]
  );
  const modelConstraints = constraints[activeModel];

  const debouncedProducts = useDebounce(modelProducts, 280);
  const debouncedConstraints = useDebounce(modelConstraints, 280);

  const workerRef = useRef<Worker | null>(null);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (debouncedProducts.length < debouncedConstraints.minComboSize) {
      setCalcResult([], [], [], null);
      setIsCalculating(false);
      terminateWorker();
      return;
    }

    setIsCalculating(true);
    terminateWorker();

    const worker = new Worker(
      new URL('../workers/calcWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'calcResult') {
        const { results, allResults, paretoFront, summary } = msg.output;
        setCalcResult(results, allResults, paretoFront, summary);
        setIsCalculating(false);
        worker.terminate();
        if (workerRef.current === worker) {
          workerRef.current = null;
        }
      }
    };

    worker.onerror = () => {
      setIsCalculating(false);
      worker.terminate();
      if (workerRef.current === worker) {
        workerRef.current = null;
      }
    };

    const message: WorkerMessage = {
      type: 'calculate',
      products: debouncedProducts,
      constraints: debouncedConstraints,
    };
    worker.postMessage(message);

    return () => {
      terminateWorker();
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
      <div className="mt-6">
        <AnalysisPanel />
      </div>
    </div>
  );

  return <MainLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
}
