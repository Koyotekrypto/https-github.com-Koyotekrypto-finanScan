import React, { useState, useMemo } from 'react';
import { type Transaction, type TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { TransactionList } from '../components/TransactionList';
import { IncomeIcon, ExpenseIcon } from '../components/icons/Icons';

interface TransactionsPageProps {
  transactions: Transaction[];
  onAddTransaction: (type: TransactionType) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, onAddTransaction, onEditTransaction, onDeleteTransaction }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const inputStyles = "mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm rounded-xl bg-white dark:bg-gray-800";


  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const monthYear = new Date(t.date).toLocaleString('pt-BR', {timeZone: 'UTC', month: 'long', year: 'numeric' });
      const monthYearKey = t.date.substring(0, 7); // YYYY-MM
      months.add(JSON.stringify({label: monthYear, key: monthYearKey}));
    });
    return Array.from(months).map(m => JSON.parse(m)).sort((a,b) => b.key.localeCompare(a.key));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
      const monthMatch = filterMonth === 'all' || transaction.date.startsWith(filterMonth);
      const searchMatch = searchTerm === '' || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.code.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && monthMatch && searchMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterCategory, filterMonth, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Transações</h1>
         <div className="flex gap-2">
            <button
                onClick={() => onAddTransaction('income')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition-transform duration-200 ease-in-out hover:scale-105"
            >
                <IncomeIcon className="w-5 h-5"/>
                <span className="hidden sm:inline ml-2">Nova Receita</span>
            </button>
            <button
                onClick={() => onAddTransaction('expense')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition-transform duration-200 ease-in-out hover:scale-105"
            >
                <ExpenseIcon className="w-5 h-5"/>
                <span className="hidden sm:inline ml-2">Nova Despesa</span>
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900/70 p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar por Descrição ou Código</label>
            <input 
              type="text"
              id="search-filter"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ex: Supermercado, SPM75A3B"
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Mês</label>
            <select 
              id="month-filter" 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value)}
              className={inputStyles}
            >
              <option value="all">Todos os Meses</option>
              {availableMonths.map(month => <option key={month.key} value={month.key}>{month.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Categoria</label>
            <select 
              id="category-filter" 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className={inputStyles}
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div>
          <TransactionList 
              transactions={filteredTransactions} 
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
          />
        </div>
      </div>
    </div>
  );
};