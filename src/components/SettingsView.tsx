import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, RotateCcw } from 'lucide-react';
import { useTranslation } from '../translations';
import { Language } from '../types';

export const SettingsView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [settings, setSettings] = useState(state.settings);
  const t = useTranslation(state.settings.language);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    alert(t.settingsSaved);
  };

  const handleReset = () => {
    if (confirm(t.resetConfirm)) {
      localStorage.removeItem('pos_data');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.storeSettings}</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.storeName}</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.name}
              onChange={e => setSettings({...settings, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.address}</label>
            <textarea 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              value={settings.address}
              onChange={e => setSettings({...settings, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
              <input 
                type="text" 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.phone}
                onChange={e => setSettings({...settings, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.currencySymbol}</label>
              <input 
                type="text" 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.currency}
                onChange={e => setSettings({...settings, currency: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.language}</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.language}
              onChange={e => setSettings({...settings, language: e.target.value as Language})}
            >
              <option value="en">English</option>
              <option value="ky">Кыргызча</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-between items-center">
          <button 
            onClick={handleReset}
            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-2"
          >
            <RotateCcw size={16} /> {t.resetAppData}
          </button>

          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
          >
            <Save size={20} /> {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};
