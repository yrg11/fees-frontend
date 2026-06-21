import { useState, useEffect } from 'react';
import { listCurrencies } from '../api';
import type { CurrencyRecord } from '../api';

export default function Currencies() {
  const [currencies, setCurrencies] = useState<CurrencyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCurrencies()
      .then(res => setCurrencies(res.currencies || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Currencies</h1>
      {currencies.length === 0 ? (
        <p className="text-gray-500">No currencies configured.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decimal Places</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currencies.map((c) => (
                <tr key={c.code}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.decimal_places}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.is_base ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
