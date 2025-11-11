import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, CloseIcon, IncomeIcon, ExpenseIcon, ScannerIcon } from './icons/Icons';

interface FloatingActionButtonProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAddIncome, onAddExpense }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleScan = () => {
    navigate('/scanner');
    setIsOpen(false);
  };

  const handleAddIncome = () => {
    onAddIncome();
    setIsOpen(false);
  };
  
  const handleAddExpense = () => {
    onAddExpense();
    setIsOpen(false);
  };

  const actions = [
    { label: 'Adicionar Receita', icon: <IncomeIcon className="w-6 h-6" />, action: handleAddIncome, bg: 'bg-green-500' },
    { label: 'Adicionar Despesa', icon: <ExpenseIcon className="w-6 h-6" />, action: handleAddExpense, bg: 'bg-red-500' },
    { label: 'Escanear Recibo', icon: <ScannerIcon className="w-6 h-6" />, action: handleScan, bg: 'bg-gray-500' },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-6">
      <div className="relative flex flex-col items-end gap-3">
        {isOpen && (
          <div className="flex flex-col items-end gap-3 transition-all duration-300 ease-in-out">
            {actions.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                 <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">{item.label}</span>
                 <button
                    onClick={item.action}
                    className={`w-14 h-14 rounded-full text-white ${item.bg} hover:opacity-90 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110`}
                    title={item.label}
                    aria-label={item.label}
                 >
                    {item.icon}
                 </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar ações" : "Abrir ações"}
        >
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <PlusIcon />
          </div>
        </button>
      </div>
    </div>
  );
};