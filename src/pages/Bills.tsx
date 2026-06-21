import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listBills, createBill, listCurrencies } from '../api';
import type { Bill, CurrencyRecord } from '../api';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Create form
  const [currency, setCurrency] = useState('USD');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [creating, setCreating] = useState(false);

  async function loadBills() {
    try {
      const res = await listBills(statusFilter || undefined);
      setBills(res.bills || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
    listCurrencies().then(res => setCurrencies(res.currencies || [])).catch(() => {});
  }, [statusFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createBill(currency, new Date(periodStart).toISOString(), new Date(periodEnd).toISOString());
      setShowCreate(false);
      setPeriodStart('');
      setPeriodEnd('');
      setLoading(true);
      loadBills();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create bill');
    } finally {
      setCreating(false);
    }
  }

  function formatAmount(minor: number, curr: string) {
    const decimals = currencies.find(c => c.code === curr)?.decimal_places ?? 2;
    return (minor / Math.pow(10, decimals)).toFixed(decimals) + ' ' + curr;
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm cursor-pointer"
        >
          New Bill
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {currencies.length > 0
                  ? currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)
                  : <option value="USD">USD</option>
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm cursor-pointer"
          >
            {creating ? 'Creating...' : 'Create Bill'}
          </button>
        </form>
      )}

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {bills.length === 0 ? (
        <p className="text-gray-500">No bills found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <Link to={`/bills/${bill.id}`} className="text-blue-600 hover:underline">
                      #{bill.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bill.currency}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(bill.period_start).toLocaleDateString()} - {new Date(bill.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatAmount(bill.total_amount_minor, bill.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
