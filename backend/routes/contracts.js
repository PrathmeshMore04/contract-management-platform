const express = require('express');
const router = express.Router();
const {
  createContract,
  getAllContracts,
  updateContractStatus
} = require('../controllers/contractController');

router.post('/', createContract);

router.get('/', getAllContracts);

router.patch('/:id/status', updateContractStatus);

module.exports = router;