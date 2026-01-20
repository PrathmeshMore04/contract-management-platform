const express = require('express');
const router = express.Router();
const {
  createBlueprint,
  getAllBlueprints,
  getBlueprintById,
  updateBlueprint,
  deleteBlueprint
} = require('../controllers/blueprintController');

// POST /api/blueprints - Create a new blueprint
router.post('/', createBlueprint);

// GET /api/blueprints - Get all blueprints
router.get('/', getAllBlueprints);

// GET /api/blueprints/:id - Get a single blueprint
router.get('/:id', getBlueprintById);

// PUT /api/blueprints/:id - Update a blueprint
router.put('/:id', updateBlueprint);

// DELETE /api/blueprints/:id - Delete a blueprint
router.delete('/:id', deleteBlueprint);

module.exports = router;
