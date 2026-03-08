import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../translations';
import { Download, Calendar, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const ReportsView: React.FC = () => {
  const { state } = useStore();
  const t = useTranslation(state.settings.language);
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [customDate, setCustomDate] = useState(new Date());

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    const now = customDate;
    let start: Date, end: Date;

    switch (period) {
      case 'daily':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'weekly':
        start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'yearly':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
    }

    return state.transactions.filter(tx => 
      isWithinInterval(tx.timestamp, { start, end })
    );
  }, [state.transactions, period, customDate]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
    const totalTx = filteredTransactions.length;
    const avgValue = totalTx > 0 ? totalSales / totalTx : 0;
    
    // Group by payment method
    const byPayment = filteredTransactions.reduce((acc, tx) => {
      acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.total;
      return acc;
    }, {} as Record<string, number>);

    return { totalSales, totalTx, avgValue, byPayment };
  }, [filteredTransactions]);

  const handleExport = () => {
    // Prepare data for Excel
    const data = filteredTransactions.map(tx => ({
      ID: tx.id,
      Date: format(tx.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      Items: tx.items.map(i => `${i.name} (${i.quantity})`).join(', '),
      Total: tx.total,
      Payment: tx.paymentMethod,
      Currency: state.settings.currency
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    // Generate filename
    const dateStr = format(customDate, 'yyyy-MM-dd');
    const fileName = `Sales_Report_${period}_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t.reports}</h2>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
          {(['daily', 'weekly', 'monthly', 'yearly'] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
        <Calendar className="text-gray-500" />
        <input 
          type="date" 
          value={format(customDate, 'yyyy-MM-dd')}
          onChange={(e) => setCustomDate(new Date(e.target.value))}
          className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">
          {period === 'daily' && format(customDate, 'MMMM do, yyyy')}
          {period === 'weekly' && `Week of ${format(startOfWeek(customDate, { weekStartsOn: 1 }), 'MMM do')}`}
          {period === 'monthly' && format(customDate, 'MMMM yyyy')}
          {period === 'yearly' && format(customDate, 'yyyy')}
        </span>
        
        <button 
          onClick={handleExport}
          disabled={filteredTransactions.length === 0}
          className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {t.exportExcel}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.totalSales}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {state.settings.currency}{stats.totalSales.toFixed(2)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.totalTransactions}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalTx}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.averageValue}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {state.settings.currency}{stats.avgValue.toFixed(2)}
              </h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed List Preview */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">{t.salesSummary}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">{t.date}</th>
                <th className="p-4 font-semibold text-gray-600">{t.items}</th>
                <th className="p-4 font-semibold text-gray-600">{t.payment}</th>
                <th className="p-4 font-semibold text-gray-600 text-right">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    {t.noTransactions}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-900 whitespace-nowrap">
                      {format(tx.timestamp, 'MMM dd, HH:mm')}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="max-w-xs truncate">
                        {tx.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium uppercase">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900 text-right">
                      {state.settings.currency}{tx.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
