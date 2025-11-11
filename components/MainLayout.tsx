import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNavBar } from './BottomNavBar';

interface MainLayoutProps {
  onAddTransaction: () => void;
  onInstall: () => void;
  installPrompt: any;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onAddTransaction, onInstall, installPrompt }) => {
  return (
    <>
      <Header onAddTransaction={onAddTransaction} onInstall={onInstall} installPrompt={installPrompt} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNavBar />
    </>
  );
};
