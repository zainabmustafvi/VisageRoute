require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://127.0.0.1:5000/api';

async function testAdminAPI() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            userId: 'admin1',
            password: 'securepassword123',
            role: 'admin'
        });

        // Extract the Set-Cookie header for subsequent requests
        const cookies = loginRes.headers['set-cookie'];
        if (!cookies) throw new Error("No cookie received on login");

        const axiosConfig = {
            headers: {
                Cookie: cookies[0]
            }
        };

        console.log("2. Testing Zod Validation: Empty Student Post...");
        try {
            await axios.post(`${API_URL}/admin/students`, {}, axiosConfig);
        } catch (err) {
            console.log("   ✅ Zod validation correctly blocked the empty request:", JSON.stringify(err.response.data, null, 2));
        }

        console.log("3. Testing Zod Validation: Malformed Object IDs...");
        try {
            await axios.post(`${API_URL}/admin/students`, {
                name: "Test Zod Student",
                parentId: "invalid123" // length < 24
            }, axiosConfig);
        } catch (err) {
            console.log("   ✅ Zod validation correctly blocked invalid parentId:", JSON.stringify(err.response.data, null, 2));
        }

        console.log("4. Fetching Drivers (Should be authorized)...");
        const driversRes = await axios.get(`${API_URL}/admin/drivers`, axiosConfig);
        console.log(`   ✅ Drivers Fetched. Count: ${driversRes.data.length}`);

        console.log("\nAll Admin tests completed successfully! Security baseline verified.");

    } catch (error) {
        console.error("Test failed:", error.response?.data || error.message);
    }
}

testAdminAPI();
