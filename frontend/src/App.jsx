import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [categoryValue, setCategoryValue] = useState('Electronics');
  const [dataList, setDataList] = useState([]);
  const [stats, setStats] = useState({
    count: 0,
    total: 0,
    average: 0,
    max: 0,
    min: 0,
    topCategory: 'None',
    categoryBreakdown: []
  });
  const [error, setError] = useState('');

  const API_URL = 'http://13.60.37.146:5000/api/data';
  const CATEGORIES = ['Electronics', 'Food', 'Clothing', 'Other'];
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setDataList(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Is it running?');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!inputValue || isNaN(inputValue)) {
      setError('Please enter a valid numeric value.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: Number(inputValue),
          category: categoryValue
        }),
      });

      if (!response.ok) throw new Error('Failed to add data');

      setInputValue('');
      fetchData();
      fetchStats();
    } catch (err) {
      console.error(err);
      setError('Failed to save data. Please try again.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Sales Data Analyzer</h1>
        <p>A comprehensive dashboard for your business metrics</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="dashboard-content">
        <section className="card input-section">
          <h2>Add Sales Entry</h2>
          <form onSubmit={handleSubmit} className="data-form">
            <div className="form-group">
              <label htmlFor="valueInput">Sale Amount ($)</label>
              <input
                id="valueInput"
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter amount (e.g. 199.99)"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="categoryInput">Category</label>
              <select
                id="categoryInput"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                className="category-select"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="primary-btn">Record Sale</button>
          </form>
        </section>

        <section className="card stats-section">
          <h2>Key Metrics</h2>
          <div className="stats-grid metrics-grid">
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(stats.total)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Sales</h3>
              <p className="stat-value">{stats.count}</p>
            </div>
            <div className="stat-card">
              <h3>Average Sale</h3>
              <p className="stat-value">{formatCurrency(stats.average)}</p>
            </div>
            <div className="stat-card">
              <h3>Highest Sale</h3>
              <p className="stat-value">{formatCurrency(stats.max)}</p>
            </div>
            <div className="stat-card">
              <h3>Lowest Sale</h3>
              <p className="stat-value">{formatCurrency(stats.min)}</p>
            </div>
            <div className="stat-card">
              <h3>Top Category</h3>
              <p className="stat-value" style={{ fontSize: '1.8rem' }}>{stats.topCategory}</p>
            </div>
          </div>
        </section>

        <section className="card chart-section">
          <h2>Revenue by Category</h2>
          {stats.categoryBreakdown.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.categoryBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="category" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #3b82f6', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-state">No chart data available</p>
          )}
        </section>

        <section className="card chart-section">
          <h2>Category Distribution</h2>
          {stats.categoryBreakdown.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-state">No chart data available</p>
          )}
        </section>

        <section className="card list-section">
          <h2>Recent Sales</h2>
          {dataList.length === 0 ? (
            <p className="empty-state">No sales data recorded yet.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((item) => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 'bold', color: '#f8fafc' }}>{formatCurrency(item.value)}</td>
                      <td>
                        <span className="badge">{item.category}</span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
