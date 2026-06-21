import { LucideIcon } from 'lucide-react';

type StatVariant = 'default' | 'positive' | 'negative' | 'highlight';

interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: StatVariant;
  suffix?: string;
}

export default function StatBadge({
  label,
  value,
  icon: Icon,
  variant = 'default',
  suffix,
}: StatBadgeProps) {
  const variantStyles: Record<StatVariant, string> = {
    default: 'text-ink-100',
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    highlight: 'text-amber-400',
  };

  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-ink-950/50 border border-white/5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-400 font-medium">
        {Icon && <Icon className="w-3 h-3 text-amber-500" />}
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl font-bold ${variantStyles[variant]}`}>
          {value}
        </span>
        {suffix && <span className="text-xs text-ink-500 font-mono">{suffix}</span>}
      </div>
    </div>
  );
}
