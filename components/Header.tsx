import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogoIcon, PlusIcon, ScannerIcon, ListIcon, ChartIcon, HomeIcon, InstallIcon } from './icons/Icons';

interface HeaderProps {
  onAddTransaction: () => void;
  onInstall: () => void;
  installPrompt: any;
}

export const Header: React.FC<HeaderProps> = ({ onAddTransaction, onInstall, installPrompt }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white'
        : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
    }`;

  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 text-gray-900 dark:text-white">
              <LogoIcon />
              <span className="font-bold text-xl tracking-tight">FinanScan</span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-2">
                <NavLink to="/dashboard" className={navLinkClasses}><HomeIcon className="h-5 w-5"/> Dashboard</NavLink>
                <NavLink to="/transactions" className={navLinkClasses}><ListIcon className="h-5 w-5"/> Transações</NavLink>
                <NavLink to="/scanner" className={navLinkClasses}><ScannerIcon className="h-5 w-5"/> Scanner</NavLink>
                <NavLink to="/reports" className={navLinkClasses}><ChartIcon className="h-5 w-5"/> Relatórios</NavLink>
              </div>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {installPrompt && (
              <button
                onClick={onInstall}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-full flex items-center transition-all duration-300 ease-in-out"
                title="Instalar o aplicativo"
              >
                <InstallIcon />
                <span className="ml-2">Instalar App</span>
              </button>
            )}
            <button
              onClick={onAddTransaction}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <PlusIcon />
              <span className="ml-2">Adicionar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};