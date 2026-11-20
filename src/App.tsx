import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { NavigationTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeList } from './components/income/IncomeList';
import { ExpenseList } from './components/expenses/ExpenseList';
import { PaymentHistoryList } from './components/payments/PaymentHistoryList';
import { AccountCards } from './components/accounts/AccountCards';
import { TransactionLedger } from './components/transactions/TransactionLedger';
import { BudgetTracker } from './components/budgets/BudgetTracker';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { FinalSettlementView } from './components/settlement/FinalSettlementView';
import { CategoryManager } from './components/categories/CategoryManager';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { SettingsView } from './components/settings/SettingsView';

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
      case 'payments':
        return <PaymentHistoryList />;
      case 'accounts':
        return <AccountCards />;
      case 'transactions':
        return <TransactionLedger />;
      case 'budgets':
        return <BudgetTracker />;
      case 'reports':
        return <ReportsCenter />;
      case 'settlement':
        return <FinalSettlementView />;
      case 'categories':
        return <CategoryManager />;
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
        {renderActiveView()}
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
