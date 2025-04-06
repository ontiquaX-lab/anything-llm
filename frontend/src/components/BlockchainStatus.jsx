import React from 'react';
import { formatNumber } from '../utils/format';

export default function BlockchainStatus({ data }) {
  if (!data) return <div>No blockchain data available</div>;

  return (
    <div className="blockchain-status">
      <h2>Blockchain Status</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Chain Length</h3>
          <p>{formatNumber(data.chainLength)} blocks</p>
        </div>
        <div className="stat-card">
          <h3>Pending Transactions</h3>
          <p>{formatNumber(data.pendingTransactions)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Supply</h3>
          <p>{formatNumber(data.tokenomics.totalSupply)} ONTI</p>
        </div>
        <div className="stat-card">
          <h3>Circulating Supply</h3>
          <p>{formatNumber(data.tokenomics.circulatingSupply)} ONTI</p>
        </div>
      </div>
    </div>
  );
}
