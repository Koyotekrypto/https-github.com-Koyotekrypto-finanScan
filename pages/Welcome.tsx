import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon, ReceiptTextIcon, WalletIcon, ChartBarIcon } from '../components/icons/Icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl text-center border border-white/10 dark:border-white/10">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </div>
);

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="flex items-center gap-3 mb-4">
            <LogoIcon />
            <h1 className="font-bold text-4xl tracking-tight text-gray-900 dark:text-white">FinanScan</h1>
        </div>

        <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4">
            Bem-vindo(a) ao seu assistente financeiro! 👋
        </h2>

        <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-400 mb-12">
            Transforme a maneira como você gerencia suas finanças. Digitalize recibos, acompanhe despesas e visualize seus gastos, tudo em um só lugar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
            <FeatureCard
                icon={<ReceiptTextIcon className="w-8 h-8" />}
                title="Digitalize e Extraia"
                description="Use a câmera para capturar recibos e nossa IA extrairá os dados para você em segundos."
            />
            <FeatureCard
                icon={<WalletIcon className="w-8 h-8" />}
                title="Organize Suas Finanças"
                description="Categorize despesas e receitas facilmente para ter uma visão clara de para onde seu dinheiro está indo."
            />
            <FeatureCard
                icon={<ChartBarIcon className="w-8 h-8" />}
                title="Visualize Seus Gastos"
                description="Relatórios e gráficos intuitivos que ajudam você a entender seus hábitos financeiros e a economizar mais."
            />
        </div>

        <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
            Começar Agora
        </button>
    </div>
  );
};
