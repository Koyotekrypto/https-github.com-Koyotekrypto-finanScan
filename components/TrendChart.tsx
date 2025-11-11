import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type Transaction } from '../types';

interface TrendChartProps {
    transactions: Transaction[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ transactions }) => {
    const data = useMemo(() => {
        const monthlyData: { [key: string]: { name: string, Receitas: number, Despesas: number } } = {};
        const today = new Date();
        
        // Initialize the last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyData[monthKey] = { name: monthKey, Receitas: 0, Despesas: 0 };
        }

        // Populate with transaction data
        transactions.forEach(t => {
            const transactionDate = new Date(t.date);
            const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
            
            if (transactionDate >= twelveMonthsAgo) {
                 const monthKey = transactionDate.toLocaleString('default', { timeZone: 'UTC', month: 'short', year: '2-digit' });
                 if (monthlyData[monthKey]) {
                     if (t.type === 'income') {
                         monthlyData[monthKey].Receitas += t.amount;
                     } else {
                         monthlyData[monthKey].Despesas += t.amount;
                     }
                 }
            }
        });

        return Object.values(monthlyData).map(month => ({
            ...month,
            Saldo: month.Receitas - month.Despesas
        }));
    }, [transactions]);

    if (transactions.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Dados insuficientes para o gráfico de tendência.</div>;
    }

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value: number) => `R$${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                        formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), name]}
                        contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            border: '1px solid #4B5563',
                            borderRadius: '0.5rem'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Receitas" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Despesas" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Saldo" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};