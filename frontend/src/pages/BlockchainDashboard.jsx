import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import BlockchainStatus from '../components/BlockchainStatus';
import TransactionForm from '../components/TransactionForm';
import RecentTransactions from '../components/RecentTransactions';

export default function BlockchainDashboard() {
  const { user } = useAuth();
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    try {
      const [statusRes, txRes] = await Promise.all([
        api.get('/blockchain/status'),
        api.get('/blockchain/transactions')
      ]);
      setBlockchainStatus(statusRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to fetch blockchain data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransaction = async (txData) => {
    try {
      await api.post('/blockchain/transaction', txData);
      await fetchBlockchainData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  if (loading) return <div>Loading blockchain data...</div>;

  return (
    <div className="blockchain-dashboard">
      <h1>OntiBlock Dashboard</h1>
      <BlockchainStatus data={blockchainStatus} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TransactionForm onSubmit={handleSubmitTransaction} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
