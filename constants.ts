import { type Transaction } from './types';

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Outros',
];

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateRandomCode = (length: number = 8): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += ALPHANUMERIC_CHARS.charAt(Math.floor(Math.random() * ALPHANUMERIC_CHARS.length));
    }
    return result;
};


export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', code: 'SPM75A3B', date: '2024-07-20', description: 'Supermercado do Mês', amount: 350.75, type: 'expense', category: 'Alimentação' },
  { id: '2', code: 'GAS150C4', date: '2024-07-18', description: 'Gasolina', amount: 150.00, type: 'expense', category: 'Transporte' },
  { id: '3', code: 'CIN80D5E', date: '2024-07-15', description: 'Cinema', amount: 80.50, type: 'expense', category: 'Lazer' },
  { id: '4', code: 'ALU180F6', date: '2024-07-12', description: 'Aluguel', amount: 1800.00, type: 'expense', category: 'Moradia' },
  { id: '5', code: 'FAR95G7H', date: '2024-07-10', description: 'Farmácia', amount: 95.20, type: 'expense', category: 'Saúde' },
  { id: '6', code: 'SAL550I8', date: '2024-07-05', description: 'Salário Julho', amount: 5500.00, type: 'income', category: 'Salário' },
  { id: '7', code: 'JAN120J9', date: '2024-07-22', description: 'Jantar com amigos', amount: 120.00, type: 'expense', category: 'Alimentação' },
  { id: '8', code: 'CUR250K1', date: '2024-06-25', description: 'Curso Online', amount: 250.00, type: 'expense', category: 'Educação' },
];

const MOCK_DESCRIPTIONS: { [key: string]: string[] } = {
    'Alimentação': ['Padaria Pão Quente', 'Restaurante Sabor Divino', 'Mercado Central', 'iFood'],
    'Transporte': ['Uber', '99 Táxi', 'Posto Shell', 'Metrô'],
    'Moradia': ['Conta de Luz - EDP', 'Internet Fibra', 'Condomínio', 'Gás de Cozinha'],
    'Lazer': ['Ingresso Cinema', 'Show de Rock', 'Assinatura Netflix', 'Parque Aquático'],
    'Saúde': ['Consulta Médica', 'Remédios DrogaRaia', 'Plano de Saúde'],
    'Educação': ['Livro de Programação', 'Mensalidade Coursera', 'Material Escolar'],
    'Salário': ['Adiantamento Salarial', 'Pagamento Empresa X'],
    'Outros': ['Presente de Aniversário', 'Doação para Caridade', 'Pet Shop'],
};


export const generateMockTransactions = (count: number): Transaction[] => {
    const transactions: Transaction[] = [];
    const existingCodes = new Set(MOCK_TRANSACTIONS.map(t => t.code));

    for (let i = 0; i < count; i++) {
        const type = Math.random() > 0.3 ? 'expense' : 'income';
        const category = type === 'income' ? 'Salário' : CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 2))];
        const descriptions = MOCK_DESCRIPTIONS[category] || ['Transação Aleatória'];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        const amount = parseFloat((Math.random() * (type === 'expense' ? 200 : 2000) + 10).toFixed(2));
        const date = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        let code;
        do {
            code = generateRandomCode();
        } while (existingCodes.has(code));
        existingCodes.add(code);

        transactions.push({
            id: new Date().toISOString() + Math.random(),
            code,
            date,
            description,
            amount,
            type,
            category
        });
    }
    return transactions;
};