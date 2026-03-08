import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '../translations';

export const InventoryView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const t = useTranslation(state.settings.language);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const handleSave = () => {
    if (!currentProduct.name || !currentProduct.price) return;

    const product: Product = {
      id: currentProduct.id || uuidv4(),
      name: currentProduct.name,
      price: Number(currentProduct.price),
      barcode: currentProduct.barcode || '',
      category: currentProduct.category || 'General',
      stock: Number(currentProduct.stock) || 0,
    };

    if (currentProduct.id) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    }
    setIsEditing(false);
    setCurrentProduct({});
  };

  const handleDelete = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.inventory}</h2>
        <button 
          onClick={() => { setCurrentProduct({}); setIsEditing(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> {t.addProduct}
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder={t.searchInventory}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">{t.name}</th>
              <th className="p-4 font-semibold text-gray-600">{t.category}</th>
              <th className="p-4 font-semibold text-gray-600">{t.price}</th>
              <th className="p-4 font-semibold text-gray-600">{t.stock}</th>
              <th className="p-4 font-semibold text-gray-600 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.barcode}</div>
                </td>
                <td className="p-4 text-gray-600">{product.category}</td>
                <td className="p-4 font-medium text-gray-900">{state.settings.currency}{product.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => { setCurrentProduct(product); setIsEditing(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">{currentProduct.id ? t.editProduct : t.newProduct}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2"
                  value={currentProduct.name || ''}
                  onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.price}</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2"
                    value={currentProduct.price || ''}
                    onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.stock}</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2"
                    value={currentProduct.stock || ''}
                    onChange={e => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2"
                    value={currentProduct.category || ''}
                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.barcode}</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2"
                    value={currentProduct.barcode || ''}
                    onChange={e => setCurrentProduct({...currentProduct, barcode: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.saveProduct}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
