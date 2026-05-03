/**
 * testFaceService.js
 * Quick smoke test — verifies faceService loads models correctly.
 * Run: node scripts/testFaceService.js
 */

const path = require('path');

// Use a 1x1 white pixel PNG as base64 for model load test
// (will return null for "no face" — that's expected and correct)
const BLANK_IMAGE_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function main() {
    try {
        console.log('\n🔬 Testing faceService...\n');

        const { extractFaceEmbedding } = require('../utils/faceService');

        console.log('📂 Model path:', path.join(
            __dirname, '../node_modules/@vladmandic/face-api/model'
        ));

        const result = await extractFaceEmbedding(BLANK_IMAGE_BASE64);

        if (result === null) {
            console.log('\n✅ SUCCESS: Models loaded & face detection ran correctly.');
            console.log('   (No face in blank image — returns null as expected)\n');
        } else {
            console.log(`\n✅ SUCCESS: Got embedding with ${result.length} dimensions.\n`);
        }
    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        console.error(err.stack);
    }
}

main();
