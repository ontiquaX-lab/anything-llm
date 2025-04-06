import React from 'react';
import { formatNumber, formatTimestamp } from '../utils/format';

export default function RecentTransactions({ transactions }) {
  if (!transactions?.length) return <div>No recent transactions</div>;

  return (
    <div className="recent-transactions">
      <h2>Recent Transactions</h2>
      <div className="transactions-list">
        {transactions.slice(0, 5).map((tx) => (
          <div key={tx.hash} className="transaction-item">
            <div className="tx-header">
              <span className="tx-hash">{tx.hash.substring(0, 12)}...</span>
              <span className="tx-amount">{formatNumber(tx.amount)} ONTI</span>
            </div>
            <div className="tx-details">
              <div>
                <span className="label">From:</span>
                <span>{tx.sender.substring(0, 8)}...</span>
              </div>
              <div>
                <span className="label">To:</span>
                <span>{tx.recipient.substring(0, 8)}...</span>
              </div>
              <div>
                <span className="label">Time:</span>
                <span>{formatTimestamp(tx.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
