import { ReactNode } from 'react';
import Header from './Header';

interface MainLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function MainLayout({ leftPanel, rightPanel }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[38%_62%] gap-6">
          <div className="space-y-6 order-2 xl:order-1 animate-fade-in">
            {leftPanel}
          </div>
          <div className="order-1 xl:order-2 animate-fade-in" style={{ animationDelay: '80ms' }}>
            {rightPanel}
          </div>
        </div>
      </main>
      <footer className="py-5 px-6 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
          <span className="font-mono">© 2026 SnackAI · 组合收益推演引擎 v2.4.1</span>
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              WebWorker 就绪
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              实时重算模式
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
