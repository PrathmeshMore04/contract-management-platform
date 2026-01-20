const Contract = require('../models/Contract');
const Blueprint = require('../models/Blueprint');

// State machine definition for contract lifecycle
const VALID_TRANSITIONS = {
  'Created': ['Approved', 'Revoked'],
  'Approved': ['Sent'],
  'Sent': ['Signed', 'Revoked'],
  'Signed': ['Locked'], // Can transition to Locked
  'Locked': [], // Immutable - no transitions allowed
  'Revoked': [] // Immutable - no transitions allowed
};

// Helper function to validate status transition
const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return true; // No change is valid
  }
  
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

// Helper function to check if contract is immutable
const isImmutable = (status) => {
  return status === 'Locked' || status === 'Revoked';
};

// @desc    Create a new contract
// @route   POST /api/contracts
// @access  Public (with mock auth)
const createContract = async (req, res) => {
  try {
    const { blueprintId, data } = req.body;

    // Validation
    if (!blueprintId) {
      return res.status(400).json({ 
        success: false,
        message: 'Blueprint ID is required' 
      });
    }

    // Validate that blueprint exists
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) {
      return res.status(404).json({
        success: false,
        message: 'Blueprint not found'
      });
    }

    // Create contract with default status 'Created'
    const contract = await Contract.create({
      blueprintId,
      data: data || {}
    });

    // Populate blueprintId for response
    await contract.populate('blueprintId', 'name');

    res.status(201).json({
      success: true,
      data: contract
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blueprint ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating contract',
      error: error.message
    });
  }
};

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Public (with mock auth)
const getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('blueprintId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving contracts',
      error: error.message
    });
  }
};

// @desc    Update contract status
// @route   PATCH /api/contracts/:id/status
// @access  Public (with mock auth)
const updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status is provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status is a valid enum value
    const validStatuses = ['Created', 'Approved', 'Sent', 'Signed', 'Locked', 'Revoked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find contract
    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check immutability - Signed and Revoked contracts cannot be changed
    if (isImmutable(contract.status)) {
      return res.status(400).json({
        success: false,
        message: `Contract with status '${contract.status}' is immutable and cannot be modified`
      });
    }

    // Validate transition
    if (!isValidTransition(contract.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from '${contract.status}' to '${status}'`
      });
    }

    // Update status
    contract.status = status;
    await contract.save();

    // Populate blueprintId for response
    await contract.populate('blueprintId', 'name');

    res.status(200).json({
      success: true,
      data: contract,
      message: `Contract status updated to '${status}'`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating contract status',
      error: error.message
    });
  }
};

module.exports = {
  createContract,
  getAllContracts,
  updateContractStatus
};
