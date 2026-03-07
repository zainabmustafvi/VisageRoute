const axios = require('axios');
const API_URL = 'http://127.0.0.1:5000/api/auth';

async function testRateLimit() {
    console.log("Testing Rate Limits on /login (Max 5 per 15 mins)...");

    // Attempt 6 logins rapidly
    for (let i = 1; i <= 6; i++) {
        try {
            console.log(`[Attempt ${i}] Requesting...`);
            const res = await axios.post(`${API_URL}/login`, {
                userId: 'admin1',
                password: 'wrongpassword', // Intentional failure
                role: 'admin'
            });
            console.log(`[Attempt ${i}] Status: ${res.status}`);
        } catch (error) {
            console.log(`[Attempt ${i}] Caught Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            if (error.response.status === 429) {
                console.log("✅ Success! Rate limiter actively blocked the request with 429 Too Many Requests.");
                break;
            }
        }
    }
}

testRateLimit();
