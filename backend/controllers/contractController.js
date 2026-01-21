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

// Helper function to check if user has permission for status transition
const hasPermissionForStatus = (userRole, targetStatus) => {
  // Admin has all permissions
  if (userRole === 'admin') {
    return true;
  }

  // Approver can transition to 'Approved' or 'Sent'
  if (userRole === 'approver') {
    return targetStatus === 'Approved' || targetStatus === 'Sent';
  }

  // Signer can transition to 'Signed'
  if (userRole === 'signer') {
    return targetStatus === 'Signed';
  }

  // Default: no permission
  return false;
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

    // Server-side validation against blueprint fields
    const incomingData = (data && typeof data === 'object') ? data : {};
    const validatedData = {};

    const fields = Array.isArray(blueprint.fields) ? blueprint.fields : [];
    for (const field of fields) {
      if (!field || !field.label) continue;

      const key = field.label;
      const hasKey = Object.prototype.hasOwnProperty.call(incomingData, key);
      const value = incomingData[key];

      // Enforce required fields when blueprint defines required=true
      // Note: blueprint field schema may not include `required`; if absent, treated as optional.
      const isRequired = field.required === true;
      if (isRequired) {
        const isMissing =
          !hasKey ||
          value === null ||
          value === undefined ||
          (field.fieldType === 'checkbox' ? value !== true : String(value).trim().length === 0);

        if (isMissing) {
          return res.status(400).json({
            success: false,
            message: `Missing required field: ${key}`
          });
        }
      }

      // Only allow fields that exist in blueprint to be saved (strip unknown fields)
      if (hasKey) {
        validatedData[key] = value;
      }
    }

    const changedBy = req.user?.role || req.user?.id || 'system';

    // Create contract with default status 'Created' and initialize history
    const contract = await Contract.create({
      blueprintId,
      data: validatedData,
      history: [
        {
          status: 'Created',
          timestamp: new Date(),
          changedBy
        }
      ]
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

    // Check role-based permissions
    const userRole = req.user?.role || 'admin';
    if (!hasPermissionForStatus(userRole, status)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to transition contracts to '${status}'. Required role: ${status === 'Approved' || status === 'Sent' ? 'approver' : status === 'Signed' ? 'signer' : 'admin'}`
      });
    }

    const previousStatus = contract.status;

    // Update status
    contract.status = status;

    // Append to history only when status actually changes
    if (previousStatus !== status) {
      const changedBy = req.user?.role || req.user?.id || 'system';
      contract.history = contract.history || [];
      contract.history.push({
        status,
        timestamp: new Date(),
        changedBy
      });
    }
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
