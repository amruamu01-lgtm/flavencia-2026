import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'emerald' | 'rose' | 'slate' | 'amber';
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'gold',
  badge,
  onClick
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return {
          border: 'border-gold-500/30 hover:border-gold-500/60',
          bg: 'bg-gradient-to-br from-gold-500/5 via-transparent to-transparent',
          iconBg: 'bg-gold-500/10 text-gold-500 dark:text-gold-400',
          valueColor: 'text-slate-900 dark:text-gold-200'
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          bg: 'bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent',
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          valueColor: 'text-emerald-700 dark:text-emerald-400'
        };
      case 'rose':
        return {
          border: 'border-rose-500/30 hover:border-rose-500/60',
          bg: 'bg-gradient-to-br from-rose-500/5 via-transparent to-transparent',
          iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          valueColor: 'text-rose-700 dark:text-rose-400'
        };
      case 'amber':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60',
          bg: 'bg-gradient-to-br from-amber-500/5 via-transparent to-transparent',
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          valueColor: 'text-amber-700 dark:text-amber-400'
        };
      default:
        return {
          border: 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700',
          bg: 'bg-white dark:bg-dark-card',
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
          valueColor: 'text-slate-900 dark:text-slate-100'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border ${styles.border} ${styles.bg} bg-white dark:bg-[#121217] backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md ${
        onClick ? 'cursor-pointer transform hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-2xl font-bold tracking-tight ${styles.valueColor}`}>
          {value}
        </div>
        {badge && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
