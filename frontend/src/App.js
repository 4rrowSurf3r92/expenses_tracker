import React, { useState, useEffect } from 'react';
import './App.css';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ExpenseTracker = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [activeTab, setActiveTab] = useState('dashboard');

  const categories = [
    'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'
  ];

  const quickAmounts = [5, 10, 20, 50, 100];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBalance = localStorage.getItem('expenseTracker_balance');
    const savedTransactions = localStorage.getItem('expenseTracker_transactions');
    
    console.log('Loading from localStorage:', { savedBalance, savedTransactions });
    
    if (savedBalance && savedBalance !== 'null' && savedBalance !== 'undefined') {
      const parsedBalance = parseFloat(savedBalance);
      if (!isNaN(parsedBalance)) {
        setBalance(parsedBalance);
      }
    }
    
    if (savedTransactions && savedTransactions !== 'null' && savedTransactions !== 'undefined') {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        if (Array.isArray(parsedTransactions)) {
          setTransactions(parsedTransactions);
        }
      } catch (error) {
        console.error('Error parsing transactions from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever balance or transactions change
  useEffect(() => {
    if (balance !== 0 || transactions.length > 0) {
      localStorage.setItem('expenseTracker_balance', balance.toString());
      console.log('Saved balance to localStorage:', balance);
    }
  }, [balance]);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('expenseTracker_transactions', JSON.stringify(transactions));
      console.log('Saved transactions to localStorage:', transactions.length);
    }
  }, [transactions]);

  const addTransaction = (amount, description, type, category = 'Other') => {
    const transaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      type, // 'income' or 'expense'
      category,
      date: new Date().toISOString(),
    };

    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);

    if (type === 'income') {
      setBalance(prev => prev + parseFloat(amount));
    } else {
      setBalance(prev => prev - parseFloat(amount));
    }
  };

  const handleAddMoney = () => {
    if (amount && parseFloat(amount) > 0) {
      addTransaction(amount, description || 'Money added', 'income');
      setAmount('');
      setDescription('');
    }
  };

  const handleAddExpense = () => {
    if (amount && parseFloat(amount) > 0) {
      addTransaction(amount, description || 'Expense', 'expense', category);
      setAmount('');
      setDescription('');
    }
  };

  const handleQuickExpense = (quickAmount) => {
    addTransaction(quickAmount, `Quick expense $${quickAmount}`, 'expense', category);
  };

  // Generate daily spending data for the last 30 days
  const generateDailySpendingData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && format(parseISO(t.date), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        spending: dayExpenses,
        fullDate: dateStr
      });
    }
    return data;
  };

  // Generate balance over time data
  const generateBalanceOverTimeData = () => {
    const data = [];
    let runningBalance = 0;
    
    // Sort transactions by date (oldest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Calculate balance up to this date
      const transactionsUpToDate = sortedTransactions.filter(t => 
        format(parseISO(t.date), 'yyyy-MM-dd') <= dateStr
      );
      
      runningBalance = transactionsUpToDate.reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        balance: runningBalance,
        fullDate: dateStr
      });
    }
    
    return data;
  };

  const dailySpendingData = generateDailySpendingData();
  const balanceOverTimeData = generateBalanceOverTimeData();

  const recentTransactions = transactions.slice(0, 5);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Expense Habit Tracker</h1>
            <p className="text-xl mb-8">Take control of your daily spending habits</p>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 inline-block">
              <h2 className="text-3xl font-bold">Current Balance</h2>
              <p className="text-4xl font-bold text-green-200">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {['dashboard', 'history', 'analytics'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Add Money */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add Money</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleAddMoney}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Money
                  </button>
                </div>
              </div>

              {/* Add Expense */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add Expense</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddExpense}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Expense Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Expenses</h3>
              <div className="grid grid-cols-5 gap-3">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleQuickExpense(amount)}
                    className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-600">Total Income</h3>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-600">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-600">Net Balance</h3>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                ) : (
                  recentTransactions.map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-t">
                      <td className="px-4 py-3">{format(parseISO(transaction.date), 'MMM dd, yyyy')}</td>
                      <td className="px-4 py-3">{transaction.description}</td>
                      <td className="px-4 py-3">{transaction.category}</td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found. Start by adding some income or expenses!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Daily Spending Trends */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Daily Spending Trends (Last 30 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="spending" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Balance Over Time */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Balance Over Time (Last 30 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#14b8a6" 
                      strokeWidth={2}
                      dot={{ fill: '#14b8a6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ExpenseTracker />
    </div>
  );
}

export default App;