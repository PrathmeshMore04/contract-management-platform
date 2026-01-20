const Blueprint = require('../models/Blueprint');

// @desc    Create a new blueprint
// @route   POST /api/blueprints
// @access  Public (with mock auth)
const createBlueprint = async (req, res) => {
  try {
    const { name, fields } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Blueprint name is required' });
    }

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'Fields array is required' });
    }

    // Validate each field
    for (const field of fields) {
      if (!field.label) {
        return res.status(400).json({ message: 'Each field must have a label' });
      }
      if (!field.fieldType || !['text', 'date', 'signature', 'checkbox'].includes(field.fieldType)) {
        return res.status(400).json({ 
          message: 'Each field must have a valid fieldType (text, date, signature, checkbox)' 
        });
      }
    }

    const blueprint = await Blueprint.create({
      name,
      fields
    });

    res.status(201).json({
      success: true,
      data: blueprint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blueprint',
      error: error.message
    });
  }
};

// @desc    Get all blueprints
// @route   GET /api/blueprints
// @access  Public (with mock auth)
const getAllBlueprints = async (req, res) => {
  try {
    const blueprints = await Blueprint.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: blueprints.length,
      data: blueprints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blueprints',
      error: error.message
    });
  }
};

// @desc    Get a single blueprint by ID
// @route   GET /api/blueprints/:id
// @access  Public (with mock auth)
const getBlueprintById = async (req, res) => {
  try {
    const blueprint = await Blueprint.findById(req.params.id);

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        message: 'Blueprint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blueprint
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blueprint ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error retrieving blueprint',
      error: error.message
    });
  }
};

// @desc    Update a blueprint by ID
// @route   PUT /api/blueprints/:id
// @access  Public (with mock auth)
const updateBlueprint = async (req, res) => {
  try {
    const { name, fields } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Blueprint name is required' });
    }

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'Fields array is required' });
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Fields array cannot be empty' });
    }

    // Validate each field
    for (const field of fields) {
      if (!field.label) {
        return res.status(400).json({ message: 'Each field must have a label' });
      }
      if (!field.fieldType || !['text', 'date', 'signature', 'checkbox'].includes(field.fieldType)) {
        return res.status(400).json({ 
          message: 'Each field must have a valid fieldType (text, date, signature, checkbox)' 
        });
      }
    }

    const blueprint = await Blueprint.findByIdAndUpdate(
      req.params.id,
      { name, fields },
      { new: true, runValidators: true }
    );

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        message: 'Blueprint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blueprint
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blueprint ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating blueprint',
      error: error.message
    });
  }
};

// @desc    Delete a blueprint by ID
// @route   DELETE /api/blueprints/:id
// @access  Public (with mock auth)
const deleteBlueprint = async (req, res) => {
  try {
    const blueprint = await Blueprint.findByIdAndDelete(req.params.id);

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        message: 'Blueprint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blueprint deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blueprint ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting blueprint',
      error: error.message
    });
  }
};

module.exports = {
  createBlueprint,
  getAllBlueprints,
  getBlueprintById,
  updateBlueprint,
  deleteBlueprint
};
