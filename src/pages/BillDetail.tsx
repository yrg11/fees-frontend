import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBill, addLineItem, cancelLineItem, closeBill, listCurrencies } from '../api';
import type { Bill, LineItem, CurrencyRecord } from '../api';

export default function BillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add line item form
  const [showAdd, setShowAdd] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      const [billRes, currRes] = await Promise.all([
        getBill(Number(id)),
        listCurrencies(),
      ]);
      setBill(billRes.bill);
      setLineItems(billRes.line_items || []);
      setCurrencies(currRes.currencies || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleAddLineItem(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      await addLineItem(Number(id), description, Math.round(Number(amount) * 100), currency, date);
      setShowAdd(false);
      setDescription('');
      setAmount('');
      // Reload to get updated bill
      setTimeout(load, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add line item');
    } finally {
      setAdding(false);
    }
  }

  async function handleCancel(lineItemId: number) {
    if (!confirm('Cancel this line item?')) return;
    try {
      await cancelLineItem(Number(id), lineItemId);
      setTimeout(load, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel line item');
    }
  }

  async function handleClose() {
    if (!confirm('Close this bill? This cannot be undone.')) return;
    try {
      await closeBill(Number(id));
      setTimeout(load, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to close bill');
    }
  }

  function formatAmount(minor: number, curr: string) {
    const decimals = currencies.find(c => c.code === curr)?.decimal_places ?? 2;
    return (minor / Math.pow(10, decimals)).toFixed(decimals) + ' ' + curr;
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!bill) return <p className="text-red-600">Bill not found</p>;

  return (
    <div>
      <button onClick={() => navigate('/bills')} className="text-blue-600 hover:underline text-sm mb-4 cursor-pointer">
        &larr; Back to Bills
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bill #{bill.id}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date(bill.period_start).toLocaleDateString()} - {new Date(bill.period_end).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              bill.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {bill.status}
            </span>
            {bill.status === 'OPEN' && (
              <button
                onClick={handleClose}
                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm cursor-pointer"
              >
                Close Bill
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Currency</p>
            <p className="font-medium">{bill.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Total</p>
            <p className="font-medium">{formatAmount(bill.total_amount_minor, bill.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Created</p>
            <p className="font-medium">{new Date(bill.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
        {bill.status === 'OPEN' && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm cursor-pointer"
          >
            Add Line Item
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleAddLineItem} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (major units)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm cursor-pointer"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      {lineItems.length === 0 ? (
        <p className="text-gray-500">No line items yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (Original)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (Bill)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FX Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatAmount(item.base_amount_minor, item.base_currency)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatAmount(item.bill_amount_minor, item.bill_currency)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.fx_rate?.toFixed(6) ?? '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    {bill.status === 'OPEN' && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="text-red-600 hover:underline text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
