const express = require('express');
const router = express.Router();
const {
  createBlueprint,
  getAllBlueprints,
  getBlueprintById,
  updateBlueprint,
  deleteBlueprint
} = require('../controllers/blueprintController');

router.post('/', createBlueprint);

router.get('/', getAllBlueprints);

router.get('/:id', getBlueprintById);

router.put('/:id', updateBlueprint);

router.delete('/:id', deleteBlueprint);

module.exports = router;
