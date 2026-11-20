import React, { useState, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { NavigationTab } from './components/layout/Sidebar';

// Code-split all module views via React.lazy
const DashboardView = React.lazy(() =>
  import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView }))
);
const IncomeList = React.lazy(() =>
  import('./components/income/IncomeList').then(m => ({ default: m.IncomeList }))
);
const ExpenseList = React.lazy(() =>
  import('./components/expenses/ExpenseList').then(m => ({ default: m.ExpenseList }))
);
const AccountCards = React.lazy(() =>
  import('./components/accounts/AccountCards').then(m => ({ default: m.AccountCards }))
);
const TransactionLedger = React.lazy(() =>
  import('./components/transactions/TransactionLedger').then(m => ({ default: m.TransactionLedger }))
);
const ReportsCenter = React.lazy(() =>
  import('./components/reports/ReportsCenter').then(m => ({ default: m.ReportsCenter }))
);
const FinalSettlementView = React.lazy(() =>
  import('./components/settlement/FinalSettlementView').then(m => ({ default: m.FinalSettlementView }))
);
const AuditLogViewer = React.lazy(() =>
  import('./components/audit/AuditLogViewer').then(m => ({ default: m.AuditLogViewer }))
);
const SettingsView = React.lazy(() =>
  import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="py-24 flex flex-col items-center justify-center space-y-4">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
      <span className="absolute font-serif text-xs font-bold text-gold-400">F</span>
    </div>
    <div className="text-center">
      <p className="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">
        Loading Module
      </p>
      <p className="text-[10px] text-slate-400">FLAVENCIA 2026 • Financial Console</p>
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'income':
        return <IncomeList />;
      case 'expenses':
        return <ExpenseList />;
      case 'accounts':
        return <AccountCards />;
      case 'transactions':
        return <TransactionLedger />;
      case 'reports':
        return <ReportsCenter />;
      case 'settlement':
        return <FinalSettlementView />;
      case 'audit':
        return <AuditLogViewer />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <FinanceProvider>
      <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
        <Suspense fallback={<ViewLoadingFallback />}>
          {renderActiveView()}
        </Suspense>
      </Layout>
    </FinanceProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
