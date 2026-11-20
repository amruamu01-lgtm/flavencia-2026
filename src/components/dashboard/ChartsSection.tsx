import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const EXPENSE_PALETTE = ['#DC2626', '#EF4444', '#B91C1C', '#F87171', '#991B1B', '#FCA5A5'];

export const ChartsSection: React.FC = () => {
  const {
    filteredIncome,
    filteredExpenses,
    accountList,
    categoryList,
    budgetList
  } = useFinance();

  // 1. Prepare Daily Activity Timeline Data
  const dailyDataMap: { [date: string]: { date: string; income: number; expense: number } } = {};
  filteredIncome.forEach(i => {
    if (!dailyDataMap[i.date]) dailyDataMap[i.date] = { date: i.date, income: 0, expense: 0 };
    dailyDataMap[i.date].income += Number(i.amount) || 0;
  });
  filteredExpenses.forEach(e => {
    if (!dailyDataMap[e.date]) dailyDataMap[e.date] = { date: e.date, income: 0, expense: 0 };
    dailyDataMap[e.date].expense += Number(e.paidAmount) || 0;
  });
  const timelineData = Object.values(dailyDataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 2. Prepare Category-wise Expense Data (Pie Chart)
  const catExpenseMap: { [catId: string]: number } = {};
  filteredExpenses.forEach(e => {
    catExpenseMap[e.categoryId] = (catExpenseMap[e.categoryId] || 0) + (Number(e.paidAmount) || 0);
  });
  const categoryExpenseData = Object.entries(catExpenseMap).map(([catId, amount]) => {
    const cat = categoryList.find(c => c.categoryId === catId);
    return {
      name: cat ? cat.categoryName : catId,
      value: amount
    };
  }).filter(c => c.value > 0);

  // 3. Accounts Distribution Data
  const accountsData = accountList.map(a => ({
    name: a.accountName,
    balance: a.currentBalance || 0
  }));

  // 4. Budget Utilization Data
  const budgetUtilizationData = budgetList.map(b => {
    const cat = categoryList.find(c => c.categoryId === b.categoryId);
    const spent = filteredExpenses
      .filter(e => e.categoryId === b.categoryId)
      .reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);
    return {
      name: cat ? cat.categoryName : b.categoryId,
      Budget: b.budgetAmount,
      Spent: spent,
      Remaining: Math.max(0, b.budgetAmount - spent)
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Daily Financial Activity (Income vs Expenses) */}
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Daily Financial Velocity
            </h3>
            <p className="text-xs text-gray-500">
              Income receipts vs Actual paid disbursements
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No transactions recorded in this date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <YAxis
                  tickFormatter={val => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  labelFormatter={formatDate}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '11px', color: '#374151' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="income" name="Income (₹)" stroke="#16A34A" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Paid Expenses (₹)" stroke="#DC2626" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Category-Wise Expense Distribution */}
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Expense Allocation by Category
            </h3>
            <p className="text-xs text-gray-500">
              Actual paid amounts breakdown
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {categoryExpenseData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No expense disbursements recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryExpenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_PALETTE[index % EXPENSE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Paid Amount']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '11px', color: '#374151' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', maxHeight: '60px', overflowY: 'auto' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Account Balances Overview */}
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Liquid Account Reserves
            </h3>
            <p className="text-xs text-gray-500">
              Current closing balance across Cash, Bank & UPI
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accountsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis
                tickFormatter={val => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), 'Current Balance']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '11px', color: '#374151' }}
              />
              <Bar dataKey="balance" name="Current Balance (₹)" fill="#1E3A5F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Budget vs Actual Utilization */}
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Budget Target vs Actual Spend
            </h3>
            <p className="text-xs text-gray-500">
              Allocated ceiling vs actual paid disbursements
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {budgetUtilizationData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No budgets defined yet. Set category budgets in Budget Management.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis
                  tickFormatter={val => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '11px', color: '#374151' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Budget" name="Budget (₹)" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" name="Spent (₹)" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
