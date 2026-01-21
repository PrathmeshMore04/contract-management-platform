const express = require('express');
const router = express.Router();
const {
  createContract,
  getAllContracts,
  updateContractStatus
} = require('../controllers/contractController');

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: Create a new contract from a blueprint
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blueprintId
 *             properties:
 *               blueprintId:
 *                 type: string
 *                 description: ID of the blueprint to use for this contract
 *                 example: 507f1f77bcf86cd799439011
 *               data:
 *                 type: object
 *                 description: Field values for the contract (optional)
 *                 additionalProperties: true
 *                 example:
 *                   "Contract Name": "John Doe Employment Contract"
 *                   "Start Date": "2024-01-01"
 *     responses:
 *       201:
 *         description: Contract created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contract'
 *       400:
 *         description: Validation error (missing blueprintId or invalid format)
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
router.post('/', createContract);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [Contracts]
 *     responses:
 *       200:
 *         description: List of all contracts
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contract'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllContracts);

/**
 * @swagger
 * /contracts/{id}/status:
 *   patch:
 *     summary: Update contract status (role-based permissions apply)
 *     description: |
 *       Updates the status of a contract. Role-based permissions:
 *       - **Admin**: Can transition to any status
 *       - **Approver**: Can transition to 'Approved' or 'Sent'
 *       - **Signer**: Can transition to 'Signed'
 *       
 *       Valid status transitions:
 *       - Created → Approved, Revoked
 *       - Approved → Sent
 *       - Sent → Signed, Revoked
 *       - Signed → Locked
 *       - Locked, Revoked: Immutable (no transitions allowed)
 *     tags: [Contracts]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Created, Approved, Sent, Signed, Locked, Revoked]
 *                 description: New contract status
 *                 example: Approved
 *     responses:
 *       200:
 *         description: Contract status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contract'
 *                     message:
 *                       type: string
 *                       example: Contract status updated to 'Approved'
 *       400:
 *         description: |
 *           Bad request. Possible reasons:
 *           - Status is required
 *           - Invalid status value
 *           - Invalid transition from current status
 *           - Contract is immutable (Locked or Revoked)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Permission denied. User role does not have permission for this status transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "You do not have permission to transition contracts to 'Approved'. Required role: approver"
 *       404:
 *         description: Contract not found
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
router.patch('/:id/status', updateContractStatus);

module.exports = router;