import { useState, useCallback } from 'react';
import { Target, Activity, ChevronDown, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ParetoChart from './ParetoChart';
import SensitivityChart from './SensitivityChart';
import type { WorkerMessage } from '@/types';

type TabId = 'pareto' | 'sensitivity';
type SensitivityMode = 'single' | 'multi';

export default function AnalysisPanel() {
  const {
    paretoFront,
    sensitivityData,
    multiSensitivityData,
    selectedComboId,
    allResults,
    products,
    constraints,
    activeModel,
    setSensitivityData,
    setMultiSensitivityData,
    setIsCalculating,
    setIsSensitivityCalculating,
    isSensitivityCalculating,
    setSelectedComboId,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabId>('pareto');
  const [sensitivityParam, setSensitivityParam] = useState<'cost' | 'turnoverWeight'>('cost');
  const [sensitivityProduct, setSensitivityProduct] = useState<string>('');
  const [sensitivityMode, setSensitivityMode] = useState<SensitivityMode>('single');

  const selectedCombo = allResults.find(r => r.id === selectedComboId);

  const tabClass = (tab: TabId) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
      activeTab === tab
        ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400'
        : 'border-white/5 text-ink-400 hover:text-ink-200 hover:border-white/15'
    }`;

  const modeClass = (mode: SensitivityMode) =>
    `flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
      sensitivityMode === mode
        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
        : 'text-ink-400 border border-transparent hover:text-ink-300'
    }`;

  const runSingleSensitivity = useCallback(() => {
    if (!selectedComboId || !sensitivityProduct) return;

    const worker = new Worker(
      new URL('../../workers/calcWorker.ts', import.meta.url),
      { type: 'module' }
    );

    setIsSensitivityCalculating(true);
    setMultiSensitivityData(null);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'sensitivityResult') {
        setSensitivityData(msg.data);
        setIsSensitivityCalculating(false);
        worker.terminate();
      }
    };

    worker.onerror = () => {
      setIsSensitivityCalculating(false);
      worker.terminate();
    };

    const modelProducts = products.filter(p => p.model === activeModel);
    const message: WorkerMessage = {
      type: 'sensitivity',
      products: modelProducts,
      constraints: constraints[activeModel],
      comboId: selectedComboId,
      paramName: sensitivityParam,
      productId: sensitivityProduct,
    };
    worker.postMessage(message);
  }, [selectedComboId, sensitivityProduct, sensitivityParam, products, constraints, activeModel, setSensitivityData, setMultiSensitivityData, setIsSensitivityCalculating]);

  const runMultiSensitivity = useCallback(() => {
    if (!selectedComboId) return;

    const worker = new Worker(
      new URL('../../workers/calcWorker.ts', import.meta.url),
      { type: 'module' }
    );

    setIsSensitivityCalculating(true);
    setSensitivityData(null);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'multiSensitivityResult') {
        setMultiSensitivityData(msg.data);
        setIsSensitivityCalculating(false);
        worker.terminate();
      }
    };

    worker.onerror = () => {
      setIsSensitivityCalculating(false);
      worker.terminate();
    };

    const modelProducts = products.filter(p => p.model === activeModel);
    const message: WorkerMessage = {
      type: 'multiSensitivity',
      products: modelProducts,
      constraints: constraints[activeModel],
      comboId: selectedComboId,
    };
    worker.postMessage(message);
  }, [selectedComboId, products, constraints, activeModel, setSensitivityData, setMultiSensitivityData, setIsSensitivityCalculating]);

  const handleParetoPointClick = useCallback((comboId: string) => {
    setSelectedComboId(comboId);
    setActiveTab('sensitivity');
  }, [setSelectedComboId]);

  const comboProducts = selectedCombo?.items.map(it => it.product) ?? [];

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink-100 text-lg">多目标分析</h2>
            <p className="text-xs text-ink-500 mt-0.5">帕累托前沿 · 敏感度分析</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className={tabClass('pareto')} onClick={() => setActiveTab('pareto')}>
          <Activity className="w-4 h-4" />
          帕累托前沿
        </button>
        <button className={tabClass('sensitivity')} onClick={() => setActiveTab('sensitivity')}>
          <Target className="w-4 h-4" />
          敏感度分析
        </button>
      </div>

      {activeTab === 'pareto' && (
        <div>
          <div className="mb-3 flex items-center gap-3 text-xs text-ink-400">
            <span>有效方案 <span className="text-ink-200 font-mono font-bold">{paretoFront.length}</span></span>
            <span className="text-ink-700">·</span>
            <span>帕累托最优 <span className="text-amber-400 font-mono font-bold">{paretoFront.filter(p => p.isPareto).length}</span></span>
          </div>
          <ParetoChart data={paretoFront} onPointClick={handleParetoPointClick} selectedComboId={selectedComboId} />
        </div>
      )}

      {activeTab === 'sensitivity' && (
        <div className="space-y-4">
          {!selectedComboId ? (
            <div className="text-center py-8 text-ink-500 text-sm">
              请先在排行榜或帕累托图中点击选择一个组合方案
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-ink-950/60 border border-white/5">
                <div className="text-[10px] text-ink-500 uppercase tracking-wider font-medium mb-1">已选方案</div>
                <div className="font-mono text-sm text-amber-400 font-bold">
                  #{selectedCombo?.rank} · {selectedCombo?.items.length}品组合 · 得分 {selectedCombo?.weightedScore}
                </div>
              </div>

              <div className="flex gap-1 p-1 rounded-lg bg-ink-950/60 border border-white/5">
                <button className={modeClass('single')} onClick={() => setSensitivityMode('single')}>
                  单参数扫描
                </button>
                <button className={modeClass('multi')} onClick={() => setSensitivityMode('multi')}>
                  <Zap className="w-3 h-3 inline mr-1" />
                  全参数敏感度
                </button>
              </div>

              {sensitivityMode === 'single' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] text-ink-400 uppercase tracking-wider font-medium">
                        扫描参数
                      </label>
                      <div className="relative">
                        <select
                          value={sensitivityParam}
                          onChange={(e) => setSensitivityParam(e.target.value as 'cost' | 'turnoverWeight')}
                          className="input-base !py-2.5 appearance-none pr-8"
                        >
                          <option value="cost">进货成本</option>
                          <option value="turnoverWeight">周转权重</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] text-ink-400 uppercase tracking-wider font-medium">
                        目标单品
                      </label>
                      <div className="relative">
                        <select
                          value={sensitivityProduct}
                          onChange={(e) => setSensitivityProduct(e.target.value)}
                          className="input-base !py-2.5 appearance-none pr-8"
                        >
                          <option value="">选择商品...</option>
                          {comboProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={runSingleSensitivity}
                    disabled={!sensitivityProduct || isSensitivityCalculating}
                    className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSensitivityCalculating ? '计算中...' : (
                      <>
                        <Activity className="w-4 h-4" />
                        运行敏感度分析
                      </>
                    )}
                  </button>

                  {sensitivityData && <SensitivityChart data={sensitivityData} />}
                </>
              )}

              {sensitivityMode === 'multi' && (
                <>
                  <button
                    onClick={runMultiSensitivity}
                    disabled={isSensitivityCalculating}
                    className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSensitivityCalculating ? '计算中...' : (
                      <>
                        <Zap className="w-4 h-4" />
                        分析所有参数敏感度
                      </>
                    )}
                  </button>

                  {multiSensitivityData && multiSensitivityData.mostSensitive && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">最敏感参数</span>
                      </div>
                      <div className="font-mono text-ink-100 font-bold">
                        {multiSensitivityData.mostSensitive.productName} · {multiSensitivityData.mostSensitive.paramLabel}
                      </div>
                      <div className="text-xs text-ink-400 mt-1">
                        敏感度系数 <span className="text-rose-400 font-bold">{multiSensitivityData.mostSensitive.coefficient}</span>
                      </div>
                    </div>
                  )}

                  {multiSensitivityData && multiSensitivityData.results.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-ink-400 font-medium uppercase tracking-wider">
                        参数敏感度排名
                      </div>
                      <div className="space-y-1.5">
                        {[...multiSensitivityData.results]
                          .sort((a, b) => b.sensitivityCoefficient - a.sensitivityCoefficient)
                          .map((r, idx) => {
                            const level = r.sensitivityCoefficient > 50 ? 'high' : r.sensitivityCoefficient > 10 ? 'medium' : 'low';
                            const color = level === 'high' ? 'text-rose-400' : level === 'medium' ? 'text-amber-400' : 'text-emerald-400';
                            const bg = level === 'high' ? 'bg-rose-500/10' : level === 'medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10';
                            return (
                              <div
                                key={`${r.paramName}-${r.productId}`}
                                className={`flex items-center justify-between p-2.5 rounded-lg ${bg} border border-white/5`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-white/10 text-[10px] font-mono font-bold text-ink-300 flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm text-ink-200">{r.productName}</span>
                                  <span className="text-xs text-ink-500">· {r.paramLabel}</span>
                                </div>
                                <span className={`font-mono text-sm font-bold ${color}`}>
                                  {r.sensitivityCoefficient}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
