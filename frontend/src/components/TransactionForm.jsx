import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function TransactionForm({ onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    data: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const txData = {
      sender: user.address,
      recipient: formData.recipient,
      amount: formData.amount,
      data: formData.data ? JSON.parse(formData.data) : {}
    };

    const submissionResult = await onSubmit(txData);
    setResult(submissionResult);
    setSubmitting(false);

    if (submissionResult.success) {
      setFormData({
        recipient: '',
        amount: '',
        data: ''
      });
    }
  };

  return (
    <div className="transaction-form">
      <h2>New Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipient Address</label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Amount (ONTI)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.000001"
            step="0.000001"
            required
          />
        </div>
        <div className="form-group">
          <label>Data (JSON)</label>
          <textarea
            name="data"
            value={formData.data}
            onChange={handleChange}
            placeholder='{"note": "Optional transaction data"}'
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Transaction'}
        </button>
        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            {result.message || (result.success ? 'Transaction submitted!' : 'Error submitting transaction')}
          </div>
        )}
      </form>
    </div>
  );
}
