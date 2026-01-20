const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      error: error.response?.data || error.message
    };
  }
};

// Main test function
const runLifecycleTest = async () => {
  console.log('Starting Lifecycle Test...\n');

  let blueprintId;
  let contractId;

  try {
    // Step 1: Create a Blueprint
    console.log('Step 1: Creating Blueprint...');
    const blueprintData = {
      name: 'Test Blueprint',
      fields: []
    };

    const blueprintResponse = await apiCall('POST', '/blueprints', blueprintData);

    if (!blueprintResponse.success) {
      console.error('❌ FAILURE: Failed to create blueprint');
      console.error('Error:', blueprintResponse.message || blueprintResponse.error);
      process.exit(1);
    }

    blueprintId = blueprintResponse.data.data._id;
    console.log(`✅ Blueprint created with ID: ${blueprintId}\n`);

    // Step 2: Create a Contract
    console.log('Step 2: Creating Contract...');
    const contractData = {
      blueprintId: blueprintId,
      data: {}
    };

    const contractResponse = await apiCall('POST', '/contracts', contractData);

    if (!contractResponse.success) {
      console.error('❌ FAILURE: Failed to create contract');
      console.error('Error:', contractResponse.message || contractResponse.error);
      process.exit(1);
    }

    contractId = contractResponse.data.data._id;
    const contractStatus = contractResponse.data.data.status;
    console.log(`✅ Contract created with ID: ${contractId} | Status: ${contractStatus}\n`);

    // Step 3: Attempt Illegal Jump (Created -> Signed)
    console.log('Step 3: Attempting illegal jump (Created -> Signed)...');
    const illegalJumpResponse = await apiCall('PATCH', `/contracts/${contractId}/status`, {
      status: 'Signed'
    });

    if (illegalJumpResponse.status === 400) {
      console.log('✅ SUCCESS: Illegal jump to \'Signed\' was correctly blocked.\n');
    } else if (illegalJumpResponse.success && illegalJumpResponse.status === 200) {
      console.log('❌ FAILURE: API allowed illegal jump!\n');
      process.exit(1);
    } else {
      console.log(`⚠️  Unexpected response: Status ${illegalJumpResponse.status}`);
      console.log('Response:', illegalJumpResponse.message || illegalJumpResponse.error);
      console.log('');
    }

    // Step 4: Attempt Valid Transition (Created -> Approved)
    console.log('Step 4: Attempting valid transition (Created -> Approved)...');
    const validTransitionResponse = await apiCall('PATCH', `/contracts/${contractId}/status`, {
      status: 'Approved'
    });

    if (validTransitionResponse.success && validTransitionResponse.status === 200) {
      console.log('✅ SUCCESS: Valid transition to \'Approved\' worked.\n');
    } else {
      console.error('❌ FAILURE: Valid transition to \'Approved\' failed!');
      console.error('Error:', validTransitionResponse.message || validTransitionResponse.error);
      process.exit(1);
    }

    console.log('🎉 All lifecycle tests passed!');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error.message);
    process.exit(1);
  }
};

// Run the test
runLifecycleTest()
  .then(() => {
    console.log('\nTest completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed with error:', error);
    process.exit(1);
  });
