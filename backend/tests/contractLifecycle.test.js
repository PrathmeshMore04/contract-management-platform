const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blueprint = require('../models/Blueprint');
const Contract = require('../models/Contract');

// Test database connection
// Use a separate test database to avoid interfering with development data
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 
  (process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/[^\/]+$/, '/contract-management-test') : 'mongodb://localhost:27017/contract-management-test');

describe('Contract Lifecycle Integration Tests', () => {
  let blueprintId;
  let contractId;

  // Connect to test database before all tests
  beforeAll(async () => {
    try {
      await mongoose.connect(TEST_MONGODB_URI);
      console.log('Test database connected');
    } catch (error) {
      console.error('Test database connection error:', error);
      throw error;
    }
  });

  // Clean up database after all tests
  afterAll(async () => {
    await Blueprint.deleteMany({});
    await Contract.deleteMany({});
    await mongoose.connection.close();
    console.log('Test database connection closed');
  });

  // Clean up between tests (optional, for isolation)
  afterEach(async () => {
    // Uncomment if you want to clean up between each test
    // await Blueprint.deleteMany({});
    // await Contract.deleteMany({});
  });

  describe('Blueprint and Contract Creation', () => {
    test('POST /api/blueprints - Should create a blueprint', async () => {
      const blueprintData = {
        name: 'Test Blueprint',
        fields: [
          {
            label: 'Contract Name',
            fieldType: 'text',
            position: { x: 10, y: 20 }
          },
          {
            label: 'Start Date',
            fieldType: 'date',
            position: { x: 10, y: 50 }
          }
        ]
      };

      const response = await request(app)
        .post('/api/blueprints')
        .send(blueprintData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('Test Blueprint');
      expect(response.body.data.fields).toHaveLength(2);

      blueprintId = response.body.data._id;
    });

    test('POST /api/contracts - Should create a contract from blueprint', async () => {
      expect(blueprintId).toBeDefined();

      const contractData = {
        blueprintId: blueprintId,
        data: {
          'Contract Name': 'Test Contract',
          'Start Date': '2024-01-01'
        }
      };

      const response = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.status).toBe('Created');
      expect(response.body.data.blueprintId._id).toBe(blueprintId);

      contractId = response.body.data._id;
    });
  });

  describe('Valid Contract Status Transitions', () => {
    test('Should complete full lifecycle: Created -> Approved -> Sent -> Signed -> Locked', async () => {
      // Create a fresh contract for this test
      const contractData = {
        blueprintId: blueprintId,
        data: {}
      };

      const createResponse = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(201);

      const testContractId = createResponse.body.data._id;

      // Step 1: Created -> Approved
      const approvedResponse = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Approved' })
        .expect(200);

      expect(approvedResponse.body.success).toBe(true);
      expect(approvedResponse.body.data.status).toBe('Approved');
      expect(approvedResponse.body.message).toContain('Approved');

      // Step 2: Approved -> Sent
      const sentResponse = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Sent' })
        .expect(200);

      expect(sentResponse.body.success).toBe(true);
      expect(sentResponse.body.data.status).toBe('Sent');

      // Step 3: Sent -> Signed
      const signedResponse = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Signed' })
        .expect(200);

      expect(signedResponse.body.success).toBe(true);
      expect(signedResponse.body.data.status).toBe('Signed');

      // Step 4: Signed -> Locked
      const lockedResponse = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Locked' })
        .expect(200);

      expect(lockedResponse.body.success).toBe(true);
      expect(lockedResponse.body.data.status).toBe('Locked');

      // Verify final state
      const finalContract = await Contract.findById(testContractId);
      expect(finalContract.status).toBe('Locked');
    });
  });

  describe('Invalid Contract Status Transitions', () => {
    test('Should reject invalid transition: Created -> Signed', async () => {
      // Create a fresh contract for this test
      const contractData = {
        blueprintId: blueprintId,
        data: {}
      };

      const createResponse = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(201);

      const testContractId = createResponse.body.data._id;
      expect(createResponse.body.data.status).toBe('Created');

      // Attempt invalid transition: Created -> Signed (should skip Approved and Sent)
      const response = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Signed' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid transition');
      expect(response.body.message).toContain('Created');
      expect(response.body.message).toContain('Signed');

      // Verify contract status remains 'Created'
      const contract = await Contract.findById(testContractId);
      expect(contract.status).toBe('Created');
    });

    test('Should reject transition from Locked status', async () => {
      // Create and transition a contract to Locked
      const contractData = {
        blueprintId: blueprintId,
        data: {}
      };

      const createResponse = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(201);

      const testContractId = createResponse.body.data._id;

      // Complete valid transitions to Locked
      await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Approved' })
        .expect(200);

      await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Sent' })
        .expect(200);

      await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Signed' })
        .expect(200);

      await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Locked' })
        .expect(200);

      // Attempt to change from Locked (should fail)
      const response = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Approved' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('immutable');
      expect(response.body.message).toContain('Locked');
    });

    test('Should reject invalid transition: Approved -> Signed (skipping Sent)', async () => {
      // Create a fresh contract
      const contractData = {
        blueprintId: blueprintId,
        data: {}
      };

      const createResponse = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(201);

      const testContractId = createResponse.body.data._id;

      // Transition to Approved
      await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Approved' })
        .expect(200);

      // Attempt invalid transition: Approved -> Signed (should go through Sent first)
      const response = await request(app)
        .patch(`/api/contracts/${testContractId}/status`)
        .send({ status: 'Signed' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid transition');
      expect(response.body.message).toContain('Approved');
      expect(response.body.message).toContain('Signed');

      // Verify contract status remains 'Approved'
      const contract = await Contract.findById(testContractId);
      expect(contract.status).toBe('Approved');
    });
  });
});
