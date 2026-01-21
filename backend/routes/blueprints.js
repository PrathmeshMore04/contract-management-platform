const express = require('express');
const router = express.Router();
const {
  createBlueprint,
  getAllBlueprints,
  getBlueprintById,
  updateBlueprint,
  deleteBlueprint
} = require('../controllers/blueprintController');

/**
 * @swagger
 * /blueprints:
 *   post:
 *     summary: Create a new blueprint
 *     tags: [Blueprints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fields
 *             properties:
 *               name:
 *                 type: string
 *                 example: Employment Contract Template
 *               fields:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Field'
 *                 example:
 *                   - label: Contract Name
 *                     fieldType: text
 *                     position: { x: 10, y: 20 }
 *                   - label: Start Date
 *                     fieldType: date
 *                     position: { x: 10, y: 50 }
 *     responses:
 *       201:
 *         description: Blueprint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Blueprint'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createBlueprint);

/**
 * @swagger
 * /blueprints:
 *   get:
 *     summary: Get all blueprints
 *     tags: [Blueprints]
 *     responses:
 *       200:
 *         description: List of all blueprints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blueprint'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllBlueprints);

/**
 * @swagger
 * /blueprints/{id}:
 *   get:
 *     summary: Get a single blueprint by ID
 *     tags: [Blueprints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blueprint ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Blueprint details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Blueprint'
 *       404:
 *         description: Blueprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid blueprint ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getBlueprintById);

/**
 * @swagger
 * /blueprints/{id}:
 *   put:
 *     summary: Update a blueprint by ID
 *     tags: [Blueprints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blueprint ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fields
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Employment Contract Template
 *               fields:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Field'
 *     responses:
 *       200:
 *         description: Blueprint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Blueprint'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Blueprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateBlueprint);

/**
 * @swagger
 * /blueprints/{id}:
 *   delete:
 *     summary: Delete a blueprint by ID
 *     tags: [Blueprints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blueprint ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Blueprint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blueprint deleted successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Blueprint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid blueprint ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteBlueprint);

module.exports = router;
