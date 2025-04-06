import { Blockchain } from '../../src/blockchain';
import { verifyAuth } from '../utils/auth';

const blockchain = new Blockchain();

export const blockchainEndpoints = (router) => {
  // Submit new transaction
  router.post('/blockchain/transaction', verifyAuth, async (req, res) => {
    try {
      const { sender, recipient, amount, data } = req.body;
      const tx = {
        sender,
        recipient,
        amount: Number(amount),
        timestamp: Date.now(),
        data: data || {}
      };
      
      blockchain.createTransaction(tx);
      res.status(200).json({
        success: true,
