import { forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: LucideIcon;
  hint?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, suffix, prefix, icon: Icon, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-300 uppercase tracking-wider">
          {Icon && <Icon className="w-3.5 h-3.5 text-amber-500" />}
          {label}
        </label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-sm pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type="number"
            className={`input-base ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 font-mono text-xs pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {hint && <p className="text-[11px] text-ink-500">{hint}</p>}
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

export default NumberInput;
