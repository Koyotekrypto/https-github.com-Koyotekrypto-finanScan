import React, { useMemo, useState } from 'react';
import { type Transaction } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryChart } from '../components/CategoryChart';
import { EvolutionChart } from '../components/EvolutionChart';
import { TrendChart } from '../components/TrendChart';
import { IncomeIcon, ExpenseIcon, BalanceIcon, AISparkleIcon, SpinnerIcon } from '../components/icons/Icons';

interface ReportsProps {
  transactions: Transaction[];
  onGenerateTestData: () => void;
}

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const Reports: React.FC<ReportsProps> = ({ transactions, onGenerateTestData }) => {
  const [period, setPeriod] = useState('month');

  // State for custom report export
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [filterCode, setFilterCode] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'txt'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  
  const inputStyles = "block w-full rounded-xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 sm:text-sm bg-white dark:bg-gray-800";


  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentUTCFullYear = now.getUTCFullYear();
    const currentUTCMonth = now.getUTCMonth();

    if (period === 'year') {
      return transactions.filter(t => new Date(t.date).getUTCFullYear() === currentUTCFullYear);
    }
    if (period === '3months') {
      const threeMonthsAgo = new Date(Date.UTC(currentUTCFullYear, currentUTCMonth - 2, 1));
      return transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
    }
    // Default to 'month'
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getUTCMonth() === currentUTCMonth && transactionDate.getUTCFullYear() === currentUTCFullYear;
    });
  }, [transactions, period]);

  const { totalIncome, totalExpenses } = useMemo(() => {
    return filteredTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === 'income') acc.totalIncome += transaction.amount;
          else acc.totalExpenses += transaction.amount;
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0 }
      );
  }, [filteredTransactions]);
  
  const calculatedBalance = totalIncome - totalExpenses;

  const handleExport = () => {
    setIsExporting(true);

    const reportTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setUTCDate(end.getUTCDate() + 1); // Garante que o dia final seja inclusivo

        const dateMatch = transactionDate >= start && transactionDate < end;
        const codeMatch = !filterCode || t.code.toLowerCase().includes(filterCode.toLowerCase());
        return dateMatch && codeMatch;
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const reportSummary = reportTransactions.reduce((acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
    }, { income: 0, expense: 0 });
    const reportBalance = reportSummary.income - reportSummary.expense;

    const generationDate = new Date();
    
    setTimeout(() => {
        if (exportFormat === 'pdf') {
            generatePdf(reportTransactions, reportSummary, reportBalance, generationDate);
        } else {
            generateTxt(reportTransactions, reportSummary, reportBalance, generationDate);
        }
        setIsExporting(false);
    }, 500); // Simulate processing time
  };

  const generateTxt = (data: Transaction[], summary: {income: number, expense: number}, balance: number, generationDate: Date) => {
    let content = `Relatório Financeiro - FinanScan\n`;
    content += `========================================\n\n`;
    content += `Data de Geração: ${formatDate(generationDate)}\n`;
    content += `Período: ${formatDate(new Date(startDate))} a ${formatDate(new Date(endDate))}\n\n`;
    content += `----------------------------------------\n`;
    content += `Transações\n`;
    content += `----------------------------------------\n`;
    data.forEach(t => {
        content += `${formatDate(new Date(t.date))} | #${t.code.padEnd(9)} | ${t.description.padEnd(30)} | ${t.category.padEnd(15)} | ${(t.type === 'income' ? 'Receita' : 'Despesa').padEnd(8)} | ${formatCurrency(t.amount).padStart(12)}\n`;
    });
    content += `\n----------------------------------------\n`;
    content += `Resumo Final\n`;
    content += `----------------------------------------\n`;
    content += `Total de Receitas: ${formatCurrency(summary.income)}\n`;
    content += `Total de Despesas: ${formatCurrency(summary.expense)}\n`;
    content += `Saldo do Período: ${formatCurrency(balance)}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_finanscan_${generationDate.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePdf = (data: Transaction[], summary: {income: number, expense: number}, balance: number, generationDate: Date) => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert("Não foi possível abrir a janela de impressão. Verifique se o seu navegador está bloqueando pop-ups.");
        return;
    }

    const tableRows = data.map(t => `
        <tr>
            <td>${formatDate(new Date(t.date))}</td>
            <td>#${t.code}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
            <td style="text-align: right; color: ${t.type === 'income' ? 'green' : 'red'};">${formatCurrency(t.amount)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <html>
            <head>
                <title>Relatório Financeiro - FinanScan</title>
                <style>
                    body { font-family: sans-serif; margin: 2rem; }
                    h1, h2 { color: #1f2937; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { margin-top: 2rem; border-top: 2px solid #333; padding-top: 1rem; }
                    .summary p { margin: 0.5rem 0; font-size: 1.1rem; }
                    @media print {
                        body { margin: 1rem; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Relatório Financeiro - FinanScan</h1>
                <p><strong>Data de Geração:</strong> ${formatDate(generationDate)}</p>
                <p><strong>Período:</strong> ${formatDate(new Date(startDate))} a ${formatDate(new Date(endDate))}</p>

                <h2>Transações</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Tipo</th>
                            <th style="text-align: right;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <div class="summary">
                    <h2>Resumo Final</h2>
                    <p><strong>Total de Receitas:</strong> <span style="color: green;">${formatCurrency(summary.income)}</span></p>
                    <p><strong>Total de Despesas:</strong> <span style="color: red;">${formatCurrency(summary.expense)}</span></p>
                    <p><strong>Saldo do Período:</strong> <strong style="color: ${balance >= 0 ? 'blue' : 'red'};">${formatCurrency(balance)}</strong></p>
                </div>
            </body>
        </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm rounded-xl bg-white dark:bg-gray-800"
            >
              <option value="month">Este Mês</option>
              <option value="3months">Últimos 3 Meses</option>
              <option value="year">Este Ano</option>
          </select>
          <button
            onClick={onGenerateTestData}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-xl flex items-center justify-center transition-colors text-sm"
            title="Gerar dados de teste para popular o aplicativo"
          >
            <AISparkleIcon />
            <span className="ml-2">Gerar Dados</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Receitas" amount={totalIncome} icon={<IncomeIcon />} color="text-green-500" />
        <SummaryCard title="Despesas" amount={totalExpenses} icon={<ExpenseIcon />} color="text-red-500" />
        <SummaryCard title="Saldo" amount={calculatedBalance} icon={<BalanceIcon />} color={calculatedBalance >= 0 ? "text-blue-500" : "text-red-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900/70 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Despesas por Categoria</h2>
          <CategoryChart transactions={filteredTransactions} />
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-gray-900/70 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Evolução Receita vs. Despesa</h2>
          <EvolutionChart transactions={transactions} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/70 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tendência Financeira (Últimos 12 meses)</h2>
        <TrendChart transactions={transactions} />
      </div>
      
      {/* Custom Report Export Section */}
      <div className="bg-white dark:bg-gray-900/70 p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2">
            <AISparkleIcon />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exportar Relatório Personalizado</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Período Desejado</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyles} />
                    <span>até</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyles} />
                </div>
            </div>
            <div>
                <label htmlFor="filter-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código (Opcional)</label>
                <input 
                  type="text"
                  id="filter-code"
                  value={filterCode}
                  onChange={e => setFilterCode(e.target.value)}
                  placeholder="Filtrar por código"
                  className={`mt-1 ${inputStyles}`}
                />
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formato de Saída</label>
                <div className="flex items-center gap-4">
                    <label className="flex items-center">
                        <input type="radio" name="format" value="pdf" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">PDF</span>
                    </label>
                     <label className="flex items-center">
                        <input type="radio" name="format" value="txt" checked={exportFormat === 'txt'} onChange={() => setExportFormat('txt')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">TXT</span>
                    </label>
                </div>
            </div>
             <div className="w-full sm:w-auto sm:ml-auto">
                <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {isExporting ? <SpinnerIcon /> : null}
                    {isExporting ? 'Gerando...' : 'Gerar e Baixar Relatório'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
