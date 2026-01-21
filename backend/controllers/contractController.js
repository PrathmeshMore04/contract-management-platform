const Contract = require('../models/Contract');
const Blueprint = require('../models/Blueprint');

const VALID_TRANSITIONS = {
  'Created': ['Approved', 'Revoked'],
  'Approved': ['Sent'],
  'Sent': ['Signed', 'Revoked'],
  'Signed': ['Locked'], // Can transition to Locked
  'Locked': [],
  'Revoked': []
};

const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return true;
  }
  
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

const isImmutable = (status) => {
  return status === 'Locked' || status === 'Revoked';
};

const hasPermissionForStatus = (userRole, targetStatus) => {
  if (userRole === 'admin') {
    return true;
  }

  if (userRole === 'approver') {
    return targetStatus === 'Approved' || targetStatus === 'Sent';
  }

  if (userRole === 'signer') {
    return targetStatus === 'Signed';
  }

  return false;
};

const createContract = async (req, res) => {
  try {
    const { blueprintId, data } = req.body;

    if (!blueprintId) {
      return res.status(400).json({ 
        success: false,
        message: 'Blueprint ID is required' 
      });
    }

    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) {
      return res.status(404).json({
        success: false,
        message: 'Blueprint not found'
      });
    }

    const incomingData = (data && typeof data === 'object') ? data : {};
    const validatedData = {};

    const fields = Array.isArray(blueprint.fields) ? blueprint.fields : [];
    for (const field of fields) {
      if (!field || !field.label) continue;

      const key = field.label;
      const hasKey = Object.prototype.hasOwnProperty.call(incomingData, key);
      const value = incomingData[key];

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

      if (hasKey) {
        validatedData[key] = value;
      }
    }

    const changedBy = {
      id: req.user?.id || 'system',
      name: req.user?.name || 'System'
    };

    const contract = await Contract.create({
      blueprintId,
      data: validatedData,
      history: [
        {
          status: 'Created',
          timestamp: new Date(),
          changedBy,
          note: ''
        }
      ]
    });

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

const updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Created', 'Approved', 'Sent', 'Signed', 'Locked', 'Revoked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (isImmutable(contract.status)) {
      return res.status(400).json({
        success: false,
        message: `Contract with status '${contract.status}' is immutable and cannot be modified`
      });
    }

    if (!isValidTransition(contract.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from '${contract.status}' to '${status}'`
      });
    }

    const userRole = req.user?.role || 'admin';
    if (!hasPermissionForStatus(userRole, status)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to transition contracts to '${status}'. Required role: ${status === 'Approved' || status === 'Sent' ? 'approver' : status === 'Signed' ? 'signer' : 'admin'}`
      });
    }

    const previousStatus = contract.status;

    contract.status = status;

    if (previousStatus !== status) {
      const changedBy = {
        id: req.user?.id || 'system',
        name: req.user?.name || 'System'
      };
      contract.history = contract.history || [];
      contract.history.push({
        status,
        timestamp: new Date(),
        changedBy,
        note: typeof note === 'string' ? note : ''
      });
    }
    await contract.save();

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
