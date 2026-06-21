import { useState, useEffect } from 'react';
import { getCustomer, rotateKey } from '../api';
import type { Customer } from '../api';

export default function Account() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState('');
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    getCustomer()
      .then(res => setCustomer(res.customer))
      .finally(() => setLoading(false));
  }, []);

  async function handleRotate() {
    if (!confirm('Rotate your API key? The current key will stop working immediately.')) return;
    setRotating(true);
    setError('');
    try {
      const res = await rotateKey();
      setNewKey(res.api_key);
      localStorage.setItem('apiKey', res.api_key);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to rotate key');
    } finally {
      setRotating(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!customer) return <p className="text-red-600">Failed to load account</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Customer ID</p>
            <p className="font-mono text-sm">{customer.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Name</p>
            <p>{customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <p>{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">API Key Prefix</p>
            <p className="font-mono text-sm">{customer.api_key_prefix}...</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Created</p>
            <p>{new Date(customer.created_at).toLocaleString()}</p>
          </div>
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Rotate API Key</h2>
          <p className="text-sm text-gray-500 mb-4">
            Generate a new API key. The old key will be revoked immediately.
          </p>
          {newKey && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-md mb-4">
              <p className="text-xs text-green-700 mb-1">New API key (save it now):</p>
              <p className="font-mono text-sm break-all">{newKey}</p>
            </div>
          )}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={handleRotate}
            disabled={rotating}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm cursor-pointer"
          >
            {rotating ? 'Rotating...' : 'Rotate Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
