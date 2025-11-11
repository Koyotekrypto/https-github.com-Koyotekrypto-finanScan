import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-900/70 p-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold tracking-tight ${color}`}>
            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className={`p-3 rounded-full bg-gray-100 dark:bg-white/10 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};