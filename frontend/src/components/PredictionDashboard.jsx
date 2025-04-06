import React from 'react';
import { formatNumber, formatPercentage } from '../utils/format';

export default function PredictionDashboard({ data }) {
  if (!data) return <div>No prediction data available</div>;

  return (
    <div className="prediction-dashboard">
      <h2>Market Predictions</h2>
      <div className="predictions-grid">
        <div className="prediction-card">
          <h3>30-Day Staking Bonus</h3>
          <p className="value">{formatPercentage(data.stakingBonus)}</p>
          <p className="description">Estimated return for staking 10,000 ONTI</p>
        </div>
        <div className="prediction-card">
          <h3>Network Yield</h3>
          <p className="value">{formatPercentage(data.networkYield)}</p>
          <p className="description">Projected annual network yield</p>
        </div>
      </div>
    </div>
  );
}
