const BASE = '/api';

function getApiKey(): string | null {
  return localStorage.getItem('apiKey');
}

function authHeaders(): HeadersInit {
  const key = getApiKey();
  return key ? { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Customer APIs
export interface Customer {
  id: string;
  name: string;
  email: string;
  api_key_prefix: string;
  created_at: string;
}

export async function createCustomer(name: string, email: string) {
  return request<{ customer: Customer; api_key: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export async function getCustomer() {
  return request<{ customer: Customer }>('/customers/me');
}

export async function rotateKey() {
  return request<{ api_key: string; previous_key_revoked: boolean }>('/customers/rotate-key', {
    method: 'POST',
  });
}

// Bill APIs
export interface Bill {
  id: number;
  customer_id: string;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
  total_amount_minor: number;
  workflow_id?: string;
  created_at: string;
  closed_at?: string;
}

export interface LineItem {
  id: number;
  bill_id: number;
  description: string;
  base_currency: string;
  base_amount_minor: number;
  bill_currency: string;
  bill_amount_minor: number;
  fx_rate?: number;
  fx_rate_date?: string;
  created_at: string;
}

export async function listBills(status?: string) {
  const query = status ? `?status=${status}` : '';
  return request<{ bills: Bill[] }>(`/bills${query}`);
}

export async function createBill(currency: string, periodStart: string, periodEnd: string) {
  return request<{ bill: Bill }>('/bills', {
    method: 'POST',
    body: JSON.stringify({ currency, period_start: periodStart, period_end: periodEnd }),
  });
}

export async function getBill(billId: number) {
  return request<{ bill: Bill; line_items: LineItem[] }>(`/bills/${billId}`);
}

export async function addLineItem(billId: number, description: string, amountMinor: number, currency: string, date: string) {
  return request<{ accepted: boolean; bill_id: number }>(`/bills/${billId}/line-items`, {
    method: 'POST',
    body: JSON.stringify({ description, amount_minor: amountMinor, currency, date }),
  });
}

export async function cancelLineItem(billId: number, lineItemId: number) {
  return request<{ accepted: boolean }>(`/bills/${billId}/line-items/${lineItemId}`, {
    method: 'DELETE',
  });
}

export async function closeBill(billId: number) {
  return request<{ accepted: boolean; bill_id: number }>(`/bills/${billId}/close`, {
    method: 'POST',
  });
}

// Currency APIs
export interface CurrencyRecord {
  code: string;
  name: string;
  decimal_places: number;
  is_base: boolean;
  active: boolean;
  created_at: string;
}

export async function listCurrencies() {
  return request<{ currencies: CurrencyRecord[] }>('/currencies');
}
