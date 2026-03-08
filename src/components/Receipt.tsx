import React, { forwardRef } from 'react';
import { Transaction, StoreSettings } from '../types';
import { format } from 'date-fns';
import { useTranslation } from '../translations';

interface ReceiptProps {
  transaction: Transaction;
  settings: StoreSettings;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction, settings }, ref) => {
  const t = useTranslation(settings.language);

  return (
    <div ref={ref} className="hidden print:block print:w-[80mm] print:p-2 print:font-mono print:text-xs">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase">{settings.name}</h1>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>

      <div className="border-b border-black border-dashed my-2"></div>

      <div className="flex justify-between mb-2">
        <span>{t.date}: {format(transaction.timestamp, 'dd/MM/yyyy HH:mm')}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>{t.rcpt}: {transaction.id.slice(0, 8)}</span>
      </div>

      <div className="border-b border-black border-dashed my-2"></div>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="w-1/2">{t.items}</th>
            <th className="w-1/4 text-right">{t.qty}</th>
            <th className="w-1/4 text-right">{t.amt}</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items.map((item) => (
            <tr key={item.id}>
              <td className="truncate pr-1">{item.name}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b border-black border-dashed my-2"></div>

      <div className="flex justify-between font-bold text-lg">
        <span>{t.total.toUpperCase()}</span>
        <span>{settings.currency}{transaction.total.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-xs mt-1">
        <span>{t.payment}: {transaction.paymentMethod.toUpperCase()}</span>
      </div>

      <div className="border-b border-black border-dashed my-4"></div>

      <div className="text-center">
        <p>{t.thankYou}</p>
        <p>{t.comeAgain}</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
