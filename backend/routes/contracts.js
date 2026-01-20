const express = require('express');
const router = express.Router();
const {
  createContract,
  getAllContracts,
  updateContractStatus
} = require('../controllers/contractController');

// POST /api/contracts - Create a new contract
router.post('/', createContract);

// GET /api/contracts - Get all contracts
router.get('/', getAllContracts);

// PATCH /api/contracts/:id/status - Update contract status
router.patch('/:id/status', updateContractStatus);

module.exports = router;
