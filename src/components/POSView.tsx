import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Trash2, CreditCard, Banknote, Smartphone, Printer, Scan, Plus, Minus } from 'lucide-react';
import { Scanner } from './Scanner';
import { Receipt } from './Receipt';
import { useTranslation } from '../translations';

export const POSView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  const t = useTranslation(state.settings.language);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const handleScan = (code: string) => {
    const product = state.products.find(p => p.barcode === code);
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
      // Optional: Play beep sound
    } else {
      alert(t.productNotFound);
    }
    setShowScanner(false);
  };

  const handleCheckout = (method: 'cash' | 'card' | 'upi') => {
    if (state.cart.length === 0) return;
    
    dispatch({ type: 'COMPLETE_TRANSACTION', payload: { method } });
    
    setTimeout(() => {
      setLastTxId(state.transactions[0]?.id);
      setShowReceipt(true);
      setTimeout(() => window.print(), 500);
    }, 100);
  };

  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4 p-4 max-w-7xl mx-auto">
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex bg-gray-200 p-1 rounded-xl shrink-0">
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('products')}
        >
          {t.products}
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cart' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('cart')}
        >
          {t.cart} ({cartItemCount})
        </button>
      </div>

      {/* Left Side: Products */}
      <div className={`${activeTab === 'cart' ? 'hidden' : 'flex'} lg:flex flex-1 flex-col bg-white rounded-2xl shadow-sm overflow-hidden`}>
        <div className="p-4 border-b flex gap-3">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full pl-4 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowScanner(true)}
            className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Scan size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}
              className="flex flex-col items-start p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 group-hover:bg-white">
                <span className="text-2xl font-bold opacity-20">{product.name.charAt(0)}</span>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.stock} {t.inStock}</p>
              <div className="mt-auto font-bold text-blue-600">
                {state.settings.currency}{product.price.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Cart */}
      <div className={`${activeTab === 'products' ? 'hidden' : 'flex'} lg:flex lg:w-[400px] bg-white rounded-2xl shadow-sm flex-col h-full border-l lg:border-l-0`}>
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="text-blue-600" />
            {t.currentOrder}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <ShoppingCart size={48} className="mb-2" />
              <p>{t.cartEmpty}</p>
            </div>
          ) : (
            state.cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <div className="text-sm text-gray-500">
                    {state.settings.currency}{item.price.toFixed(2)} x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
                  <button 
                    onClick={() => dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => dispatch({ type: 'ADD_TO_CART', payload: item })}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-4">
          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
            <span>{t.total}</span>
            <span>{state.settings.currency}{cartTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleCheckout('cash')}
              disabled={state.cart.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Banknote className="mb-1" />
              <span className="text-xs font-medium">{t.cash}</span>
            </button>
            <button 
              onClick={() => handleCheckout('card')}
              disabled={state.cart.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="mb-1" />
              <span className="text-xs font-medium">{t.card}</span>
            </button>
            <button 
              onClick={() => handleCheckout('upi')}
              disabled={state.cart.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smartphone className="mb-1" />
              <span className="text-xs font-medium">{t.upi}</span>
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* Hidden Receipt for Printing */}
      {showReceipt && state.transactions.length > 0 && (
        <div className="hidden print:block">
          <Receipt 
            transaction={state.transactions[0]} 
            settings={state.settings} 
          />
        </div>
      )}
    </div>
  );
};
