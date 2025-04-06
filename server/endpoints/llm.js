import { LLMAnalytics } from '../../src/llmIntegration';
import { verifyAuth } from '../utils/auth';

const llm = new LLMAnalytics();

export const llmEndpoints = (router) => {
  // Query LLM
  router.post('/llm/query', verifyAuth, async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const response = await llm.callLLM({
        prompt,
        model: 'ontiblock-analyzer',
        tokensUsed: 0,
        cost: 0,
        timestamp: Date.now(),
        blockchainContext: context || {}
      });

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  });

  // Get predictions
  router.get('/llm/predictions', verifyAuth, async (req, res) => {
    try {
      const [stakingBonus, networkYield] = await Promise.all([
        llm.predictStakingBonus(10000, 30), // Example values
        llm.predictNetworkYield()
      ]);

      res.status(200).json({
        success: true,
        data: {
          stakingBonus,
          networkYield
        }
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  });

  // Get optimization suggestions
  router.get('/llm/optimizations', verifyAuth, async (req, res) => {
    try {
      const suggestions = await llm.getProfitOptimizationSuggestions();
      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  });
};
