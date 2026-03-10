const { io } = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const SOCKET_URL = 'http://localhost:5000';

async function testSecureSocket() {
    console.log("1. Testing Unauthenticated Socket Connection...");
    const badSocket = io(SOCKET_URL, {
        auth: { token: 'invalid_or_missing_token' }
    });

    badSocket.on('connect_error', (err) => {
        console.log(`✅ Unauthenticated connection correctly rejected: ${err.message}`);
        badSocket.disconnect();
        testAuthenticatedSocket();
    });
}

async function testAuthenticatedSocket() {
    console.log("\n2. Logging in to get a valid JWT...");
    try {
        const res = await axios.post(`${API_URL}/login`, {
            userId: 'admin1',
            password: 'securepassword123',
            role: 'admin'
        });

        // Extract token from cookie (simulation might be tricky here, let's assume successful auth sets it or returns auth token if needed)
        // Since we are using HTTP Only cookies, we need to extract from headers for this node script
        if (!res.headers['set-cookie']) {
            throw new Error("Login successful, but no set-cookie header found! Server might not be sending the JWT correctly.");
        }
        const rawCookie = res.headers['set-cookie'];
        let setCookie = '';
        if (Array.isArray(rawCookie)) setCookie = rawCookie[0];
        else setCookie = rawCookie;

        console.log("Raw Cookie Received:", setCookie);

        if (!setCookie.includes('token=')) {
            console.error("JWT Cookie is missing or invalid layout. Response:", res.data);
            process.exit(1);
        }

        const token = setCookie.split('token=')[1].split(';')[0];

        console.log("✅ Logged in. JWT Token retrieved. Attempting Socket Handshake...");

        const goodSocket = io(SOCKET_URL, {
            auth: { token }
        });

        goodSocket.on('connect', () => {
            console.log(`✅ Socket.io connected securely! Session ID: ${goodSocket.id}`);
            goodSocket.disconnect();
            console.log("\nAll Month 2 Week 4 Security Tests Passed.");
            process.exit(0);
        });

        goodSocket.on('connect_error', (err) => {
            console.error('❌ Secure connection failed:', err.message);
            process.exit(1);
        });

    } catch (err) {
        console.error("Login failed during test:", err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

testSecureSocket();
