import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const categoryOptions = [
  'Salary',
  'Freelance',
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Housing',
  'Health',
  'Entertainment',
  'Travel',
  'Education',
  'Other',
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthMode, setIsAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [transactionForm, setTransactionForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`, { headers: getAuthHeaders() });
      setTransactions(response.data);
      const summaryResponse = await axios.get(`${API_URL}/transactions/summary`, { headers: getAuthHeaders() });
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Failed to load transactions', error);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      fetchTransactions();
    }
  }, []);

  const handleAuthChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isAuthMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = isAuthMode === 'login'
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const userData = { _id: response.data._id, name: response.data.name, email: response.data.email };
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setFormData({ name: '', email: '', password: '' });
      await fetchTransactions();
      setMessage(isAuthMode === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTransactions([]);
    setSummary({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  };

  const handleTransactionChange = (event) => {
    setTransactionForm({ ...transactionForm, [event.target.name]: event.target.value });
  };

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...transactionForm,
        amount: Number(transactionForm.amount),
      };

      if (editingId) {
        await axios.put(`${API_URL}/transactions/${editingId}`, payload, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API_URL}/transactions`, payload, { headers: getAuthHeaders() });
      }

      setTransactionForm({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setEditingId(null);
      await fetchTransactions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setTransactionForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: transaction.notes || '',
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`, { headers: getAuthHeaders() });
      await fetchTransactions();
    } catch (error) {
      setMessage('Could not delete transaction');
    }
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);

  if (!user) {
    return (
      <div className="page-shell auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Expense Tracker</h1>
            <p>Track income, spending, and your overall balance.</p>
          </div>

          <div className="toggle-row">
            <button
              className={isAuthMode === 'login' ? 'active' : ''}
              onClick={() => setIsAuthMode('login')}
            >
              Login
            </button>
            <button
              className={isAuthMode === 'register' ? 'active' : ''}
              onClick={() => setIsAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {isAuthMode === 'register' && (
              <label>
                Full Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleAuthChange}
                  placeholder="John Doe"
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleAuthChange}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleAuthChange}
                placeholder="********"
              />
            </label>

            {message && <div className="message-box">{message}</div>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isAuthMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{user.name}</h2>
        </div>
        <button className="secondary-btn" onClick={handleLogout}>Logout</button>
      </header>

      <section className="summary-grid">
        <div className="summary-card income">
          <span>Total Income</span>
          <strong>{formatCurrency(summary.totalIncome)}</strong>
        </div>
        <div className="summary-card expense">
          <span>Total Expenses</span>
          <strong>{formatCurrency(summary.totalExpenses)}</strong>
        </div>
        <div className="summary-card balance">
          <span>Balance</span>
          <strong>{formatCurrency(summary.balance)}</strong>
        </div>
      </section>

      <div className="content-grid">
        <section className="panel">
          <h3>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <form className="transaction-form" onSubmit={handleTransactionSubmit}>
            <div className="form-row">
              <label>
                Title
                <input
                  type="text"
                  name="title"
                  value={transactionForm.title}
                  onChange={handleTransactionChange}
                  placeholder="Groceries"
                />
              </label>
            </div>

            <div className="form-row two-col">
              <label>
                Amount
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={handleTransactionChange}
                />
              </label>

              <label>
                Type
                <select name="type" value={transactionForm.type} onChange={handleTransactionChange}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
            </div>

            <div className="form-row two-col">
              <label>
                Category
                <select name="category" value={transactionForm.category} onChange={handleTransactionChange}>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  name="date"
                  value={transactionForm.date}
                  onChange={handleTransactionChange}
                />
              </label>
            </div>

            <label>
              Notes
              <textarea
                name="notes"
                value={transactionForm.notes}
                onChange={handleTransactionChange}
                rows="3"
                placeholder="Optional notes"
              />
            </label>

            <div className="action-row">
              <button className="primary-btn" type="submit">{editingId ? 'Update' : 'Add Transaction'}</button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingId(null);
                    setTransactionForm({
                      title: '',
                      amount: '',
                      type: 'expense',
                      category: 'Food',
                      date: new Date().toISOString().slice(0, 10),
                      notes: '',
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <h3>Recent Transactions</h3>
          <div className="transaction-list"> 
            {recentTransactions.length === 0 ? (
              <p className="empty-state">No transactions yet.</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div>
                    <strong>{transaction.title}</strong>
                    <p>{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <div className="transaction-meta">
                    <span className={transaction.type === 'income' ? 'type income' : 'type expense'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="mini-actions">
                      <button onClick={() => handleEdit(transaction)}>Edit</button>
                      <button onClick={() => handleDelete(transaction._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
