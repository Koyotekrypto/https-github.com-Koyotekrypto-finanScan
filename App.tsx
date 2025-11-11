import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { TransactionsPage } from './pages/Transactions';
import { Reports } from './pages/Reports';
import { Welcome } from './pages/Welcome';
import { AddTransactionModal } from './components/AddTransactionModal';
import { MainLayout } from './components/MainLayout';
import { type Transaction, type ExtractedData, type TransactionType } from './types';
import { MOCK_TRANSACTIONS, generateMockTransactions } from './constants';
import { extractTransactionDataFromFile } from './services/geminiService';
import { Notification } from './components/Notification';

const LOCAL_STORAGE_KEY = 'finanscan_transactions';
const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateRandomCode = (length: number = 8): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += ALPHANUMERIC_CHARS.charAt(Math.floor(Math.random() * ALPHANUMERIC_CHARS.length));
    }
    return result;
};


const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedTransactions ? JSON.parse(savedTransactions) : MOCK_TRANSACTIONS;
    } catch (error) {
      console.error("Falha ao carregar transações do armazenamento local", error);
      return MOCK_TRANSACTIONS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<ExtractedData | undefined>(undefined);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');
  const [modalInitialCode, setModalInitialCode] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Falha ao salvar transações no armazenamento local", error);
    }
  }, [transactions]);


  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('`beforeinstallprompt` event was fired.');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('PWA install prompt not available');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA prompt');
      setNotification('Aplicativo instalado com sucesso!');
    } else {
      console.log('User dismissed the PWA prompt');
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      { ...newTransaction, id: new Date().toISOString() + Math.random() },
      ...prev,
    ]);
    setNotification('Transação adicionada com sucesso!');
  }, []);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
    setNotification('Transação atualizada com sucesso!');
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    if(window.confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        setNotification('Transação excluída com sucesso!');
    }
  }, []);
  
  const generateUniqueCode = useCallback(() => {
    let newCode;
    do {
      newCode = generateRandomCode();
    } while (transactions.some(t => t.code.toLowerCase() === newCode.toLowerCase()));
    return newCode;
  }, [transactions]);

  const handleStartEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleFileSelectAndProcess = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingError(null);
    setModalInitialData(undefined);
    setEditingTransaction(null);
    setIsModalOpen(true);
    setModalInitialCode(generateUniqueCode());
    try {
        const data = await extractTransactionDataFromFile(file);
        setModalInitialData(data);
        setModalInitialType('expense');
    } catch (error: any) {
        setProcessingError(error.message || "Falha ao extrair dados do arquivo.");
    } finally {
        setIsProcessing(false);
    }
  }, [generateUniqueCode]);

  const handleOpenModalForManual = useCallback((type: TransactionType) => {
    setModalInitialData(undefined);
    setProcessingError(null);
    setIsProcessing(false);
    setEditingTransaction(null);
    setModalInitialType(type);
    setModalInitialCode(generateUniqueCode());
    setIsModalOpen(true);
  }, [generateUniqueCode]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
        setProcessingError(null);
        setModalInitialData(undefined);
        setIsProcessing(false);
        setEditingTransaction(null);
        setModalInitialCode('');
    }, 300);
  }, []);
  
  const handleGenerateTestData = useCallback(() => {
    const newTransactions = generateMockTransactions(10);
    setTransactions(prev => [...prev, ...newTransactions]);
    setNotification('10 novas transações de teste foram geradas!');
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route element={<MainLayout onAddTransaction={() => handleOpenModalForManual('expense')} onInstall={handleInstall} installPrompt={deferredPrompt} />}>
            <Route path="/dashboard" element={<Dashboard transactions={transactions} onAddTransaction={handleOpenModalForManual} onEditTransaction={handleStartEdit} onDeleteTransaction={deleteTransaction} />} />
            <Route path="/scanner" element={<Scanner onFileSelect={handleFileSelectAndProcess} onPhotoCaptured={handleFileSelectAndProcess} />} />
            <Route path="/transactions" element={<TransactionsPage transactions={transactions} onAddTransaction={handleOpenModalForManual} onEditTransaction={handleStartEdit} onDeleteTransaction={deleteTransaction} />} />
            <Route path="/reports" element={<Reports transactions={transactions} onGenerateTestData={handleGenerateTestData} />} />
          </Route>
        </Routes>
        
        {isModalOpen && (
          <AddTransactionModal
            onClose={closeModal}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onFileSelect={handleFileSelectAndProcess}
            isProcessing={isProcessing}
            initialData={modalInitialData}
            initialType={modalInitialType}
            initialCode={modalInitialCode}
            isCodeUnique={(code, currentId) => 
                !transactions.some(t => t.code.toLowerCase() === code.toLowerCase() && t.id !== currentId)
            }
            error={processingError}
            transactionToEdit={editingTransaction}
          />
        )}
        <Notification message={notification} onClose={() => setNotification(null)} />
      </div>
    </HashRouter>
  );
};

export default App;
