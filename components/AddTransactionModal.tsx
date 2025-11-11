import React, { useState, useCallback, useEffect, useRef } from 'react';
import { type Transaction, type TransactionType, type ExtractedData } from '../types';
import { CATEGORIES } from '../constants';
import { UploadIcon, SpinnerIcon, CloseIcon, AISparkleIcon, CodeIcon } from './icons/Icons';

interface AddTransactionModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  initialData?: ExtractedData;
  initialType?: TransactionType;
  initialCode?: string;
  isCodeUnique: (code: string, currentId?: string) => boolean;
  error?: string | null;
  transactionToEdit?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
    onClose, 
    onAddTransaction,
    onUpdateTransaction,
    onFileSelect,
    isProcessing,
    initialData,
    initialType = 'expense',
    initialCode,
    isCodeUnique,
    error: processingError,
    transactionToEdit
}) => {
  const isEditMode = !!transactionToEdit;
  const [type, setType] = useState<TransactionType>(initialType);
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [fileName, setFileName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      onFileSelect(selectedFile);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description);
      setCategory(transactionToEdit.category);
      setCode(transactionToEdit.code);
    } else {
        setType(initialType);
        setCode(initialCode || '');
    }
  }, [transactionToEdit, isEditMode, initialType, initialCode]);

  useEffect(() => {
      if(initialData && !isEditMode) {
        if (initialData.valor) setAmount(initialData.valor.toString());
        if (initialData.data) setDate(initialData.data);
        const desc = initialData.descricao || initialData.estabelecimento || '';
        if (desc) setDescription(desc);
        setType('expense');
      }
  }, [initialData, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!amount || !description || !category || !date || !code) {
      setFormError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (code.length < 6 || code.length > 12) {
      setFormError("O código de identificação deve ter entre 6 e 12 caracteres.");
      return;
    }

    if (!/^[a-z0-9]+$/i.test(code)) {
        setFormError("O código de identificação deve conter apenas letras e números.");
        return;
    }

    if (!isCodeUnique(code, transactionToEdit?.id)) {
        setFormError("Este código de identificação já está em uso. Por favor, escolha outro.");
        return;
    }

    const transactionData = {
        code,
        type,
        amount: parseFloat(amount),
        date,
        description,
        category,
    };

    if (isEditMode) {
        onUpdateTransaction({ ...transactionData, id: transactionToEdit.id });
    } else {
        onAddTransaction(transactionData);
    }

    onClose();
  };
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const inputStyles = "mt-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-full p-1">
            <CloseIcon />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {isEditMode ? 'Editar Transação' : 'Adicionar Transação'}
          </h2>

          {!isEditMode && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enviar nota fiscal com IA</label>
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-2xl cursor-pointer bg-white dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, ou PDF</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf"/>
                </label>
                {fileName && !isProcessing && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Arquivo: {fileName}</p>}
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center p-4 my-4 bg-blue-500/10 rounded-xl">
                  <SpinnerIcon />
                  <p className="ml-3 text-blue-800 dark:text-blue-200">Analisando documento com IA...</p>
                </div>
              )}
            </>
          )}

          {processingError && <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-3 rounded-xl">{processingError}</p>}
          {formError && <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-3 rounded-xl">{formError}</p>}
          
           {!isEditMode && (
             <div className="flex items-center gap-2 mb-4">
                <AISparkleIcon />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {(fileName || initialData) ? 'Revise os dados extraídos' : 'Ou adicione manualmente'}
                </h3>
             </div>
           )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-full">
                <button type="button" onClick={() => setType('income')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${type === 'income' ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-500'}`}>Receita</button>
                <button type="button" onClick={() => setType('expense')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-white dark:bg-gray-700 shadow text-red-600' : 'text-gray-500'}`}>Despesa</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" className={inputStyles} required />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} required />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
              <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className={inputStyles} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <CodeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            id="code" 
                            value={code} 
                            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
                            className={`${inputStyles} pl-10`}
                            required 
                            minLength={6}
                            maxLength={12}
                            placeholder="CÓDIGO"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputStyles} required>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="py-2.5 px-6 rounded-full text-sm font-semibold text-gray-800 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancelar</button>
              <button type="submit" className="py-2.5 px-6 rounded-full text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600">
                {isEditMode ? 'Salvar Alterações' : 'Salvar Transação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};