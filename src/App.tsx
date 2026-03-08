import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ReportsView } from './components/ReportsView';
import { LayoutDashboard, ShoppingCart, History, Settings, Menu, BarChart3 } from 'lucide-react';
import { AppView } from './types';
import { useTranslation } from './translations';

const MainLayout: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const t = useTranslation(state.settings.language);

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'pos', label: t.pos, icon: ShoppingCart },
    { id: 'inventory', label: t.inventory, icon: LayoutDashboard },
    { id: 'history', label: t.history, icon: History },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const renderView = () => {
    switch (state.currentView) {
      case 'pos': return <POSView />;
      case 'inventory': return <InventoryView />;
      case 'history': return <HistoryView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <POSView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm z-10">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tight">{t.appTitle}</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                state.currentView === item.id 
                  ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.adminUser}</p>
              <p className="text-xs text-gray-500">{t.storeManager}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <h1 className="font-bold text-lg">{t.appTitle}</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 space-y-2" onClick={e => e.stopPropagation()}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  dispatch({ type: 'SET_VIEW', payload: item.id });
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                  state.currentView === item.id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative pt-16 md:pt-0">
        {renderView()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
