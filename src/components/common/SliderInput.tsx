import { LucideIcon } from 'lucide-react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  icon?: LucideIcon;
  displayValue?: string;
  accent?: 'amber' | 'emerald' | 'rose';
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  icon: Icon,
  displayValue,
  accent = 'amber',
}: SliderInputProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const accentMap = {
    amber: 'from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    emerald: 'from-emerald-400 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    rose: 'from-rose-400 to-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
  };
  const trackColor = accentMap[accent];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-300 uppercase tracking-wider">
          {Icon && <Icon className="w-3.5 h-3.5 text-amber-500" />}
          {label}
        </label>
        <span className="font-mono text-sm font-semibold text-amber-400">
          {displayValue ?? value}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-ink-950 border border-white/5 overflow-visible">
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-full rounded-full bg-gradient-to-r ${trackColor}`}
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-ink-950 border-2 border-amber-400 pointer-events-none transition-all"
          style={{ left: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-ink-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
