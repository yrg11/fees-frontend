import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Bills from './pages/Bills';
import BillDetail from './pages/BillDetail';
import Currencies from './pages/Currencies';
import Account from './pages/Account';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('apiKey'));

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    } else {
      localStorage.removeItem('apiKey');
    }
  }, [apiKey]);

  if (!apiKey) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register onLogin={setApiKey} />} />
          <Route path="*" element={<Login onLogin={setApiKey} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout onLogout={() => setApiKey(null)}>
        <Routes>
          <Route path="/" element={<Navigate to="/bills" replace />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/bills/:id" element={<BillDetail />} />
          <Route path="/currencies" element={<Currencies />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Navigate to="/bills" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
