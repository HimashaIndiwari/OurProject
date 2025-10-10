import axios from 'axios';

const testAPI = async () => {
  try {
    console.log('=== TESTING API ENDPOINTS ===\n');

    // Test if server is running
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('Error:', error.message);
      return;
    }

    // Test sessions endpoint (this will require authentication)
    try {
      const response = await axios.get('http://localhost:5000/api/sessions');
      console.log('✅ Sessions endpoint accessible');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Sessions endpoint error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testAPI();

