import React from 'react';
import { type Transaction } from '../types';
import { IncomeIcon, ExpenseIcon, EditIcon, TrashIcon } from './icons/Icons';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction; onEdit?: (t: Transaction) => void; onDelete?: (id: string) => void; }> = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-green-500' : 'text-red-400 dark:text-red-500';
  const Icon = isIncome ? IncomeIcon : ExpenseIcon;
  const sign = isIncome ? '+' : '-';

  const handleEdit = () => {
    if (typeof onEdit === 'function') {
      onEdit(transaction);
    }
  };

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(transaction.id);
    }
  };

  return (
    <li className="bg-white dark:bg-gray-900/70 p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`flex-shrink-0 p-2.5 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
          <Icon className={`${amountColor} w-5 h-5`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{transaction.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap">
            <span>{transaction.category}</span>
            <span className="font-mono bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-xs">#{transaction.code}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right ml-4">
        <div className="flex-shrink-0">
          <p className={`font-semibold text-base ${amountColor}`}>
            {sign} {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-sm text-gray-400">{new Date(transaction.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center flex-shrink-0">
            {onEdit && (
              <button onClick={handleEdit} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                <EditIcon className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete }) => {
    if (transactions.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma transação encontrada.</p>;
    }

  return (
    <ul className="space-y-3">
      {transactions.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
};