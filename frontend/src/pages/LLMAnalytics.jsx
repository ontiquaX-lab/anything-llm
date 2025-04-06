import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import LLMQueryForm from '../components/LLMQueryForm';
import PredictionDashboard from '../components/PredictionDashboard';
import OptimizationSuggestions from '../components/OptimizationSuggestions';

export default function LLMAnalytics() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState(null);
  const [optimizations, setOptimizations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLLMData();
  }, []);

  const fetchLLMData = async () => {
    try {
      const [predRes, optRes] = await Promise.all([
        api.get('/llm/predictions'),
        api.get('/llm/optimizations')
      ]);
      setPredictions(predRes.data);
      setOptimizations(optRes.data);
    } catch (err) {
      console.error('Failed to fetch LLM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async (query) => {
    try {
      const response = await api.post('/llm/query', { prompt: query });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  if (loading) return <div>Loading LLM analytics...</div>;

  return (
    <div className="llm-analytics">
      <h1>ONTI AI Analytics</h1>
      <div className="grid grid-cols-1 gap-4">
        <LLMQueryForm onSubmit={handleQuerySubmit} />
        <PredictionDashboard data={predictions} />
        <OptimizationSuggestions suggestions={optimizations} />
      </div>
    </div>
  );
}
