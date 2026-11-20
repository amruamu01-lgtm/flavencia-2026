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
          border: 'border-gray-200 hover:border-gray-300',
          bg: '',
          iconBg: 'bg-navy-50 text-[#1E3A5F]',
          valueColor: 'text-[#1E3A5F]'
        };
      case 'emerald':
        return {
          border: 'border-emerald-200 hover:border-emerald-300',
          bg: '',
          iconBg: 'bg-emerald-50 text-[#16A34A]',
          valueColor: 'text-[#16A34A]'
        };
      case 'rose':
        return {
          border: 'border-rose-200 hover:border-rose-300',
          bg: '',
          iconBg: 'bg-rose-50 text-[#DC2626]',
          valueColor: 'text-[#DC2626]'
        };
      case 'amber':
        return {
          border: 'border-amber-200 hover:border-amber-300',
          bg: '',
          iconBg: 'bg-amber-50 text-amber-700',
          valueColor: 'text-amber-700'
        };
      default:
        return {
          border: 'border-gray-200 hover:border-gray-300',
          bg: '',
          iconBg: 'bg-gray-100 text-[#374151]',
          valueColor: 'text-[#374151]'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border ${styles.border} bg-white transition-all shadow-none hover:shadow-sm ${
        onClick ? 'cursor-pointer transform hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
