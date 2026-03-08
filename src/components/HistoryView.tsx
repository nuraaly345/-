import React from 'react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';
import { Receipt } from './Receipt';
import { Printer } from 'lucide-react';
import { useTranslation } from '../translations';

export const HistoryView: React.FC = () => {
  const { state } = useStore();
  const [selectedTx, setSelectedTx] = React.useState<string | null>(null);
  const t = useTranslation(state.settings.language);

  const handlePrint = (txId: string) => {
    setSelectedTx(txId);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.transactionHistory}</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">{t.id}</th>
              <th className="p-4 font-semibold text-gray-600">{t.date}</th>
              <th className="p-4 font-semibold text-gray-600">{t.items}</th>
              <th className="p-4 font-semibold text-gray-600">{t.total}</th>
              <th className="p-4 font-semibold text-gray-600">{t.payment}</th>
              <th className="p-4 font-semibold text-gray-600 text-right">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {state.transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-sm text-gray-500">{tx.id.slice(0, 8)}</td>
                <td className="p-4 text-gray-900">{format(tx.timestamp, 'MMM dd, HH:mm')}</td>
                <td className="p-4 text-gray-600">{tx.items.length} items</td>
                <td className="p-4 font-bold text-gray-900">{state.settings.currency}{tx.total.toFixed(2)}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium uppercase">
                    {tx.paymentMethod}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handlePrint(tx.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Reprint Receipt"
                  >
                    <Printer size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {state.transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {t.noTransactions}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Hidden Receipt for Printing */}
      {selectedTx && (
        <div className="hidden print:block">
          <Receipt 
            transaction={state.transactions.find(t => t.id === selectedTx)!} 
            settings={state.settings} 
          />
        </div>
      )}
    </div>
  );
};
