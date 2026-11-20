import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

const TAB_TITLES: Record<NavigationTab, string> = {
  dashboard: 'Executive Dashboard',
  income: 'Income Management',
  expenses: 'Expense Management',
  accounts: 'Cash & Bank Management',
  transactions: 'Transaction History',
  reports: 'Financial Reports Center',
  settlement: 'Festival Final Settlement',
  audit: 'Audit Logs & Activity History',
  settings: 'System & Database Settings'
};

export const Layout: React.FC<LayoutProps> = ({ activeTab, onSelectTab, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#374151] flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(prev => !prev)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsOpenMobile(prev => !prev)}
          activeTabTitle={TAB_TITLES[activeTab] || 'FLAVENCIA 2026'}
        />

        {/* View Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
