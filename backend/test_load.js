const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const faceapi = require('@vladmandic/face-api/dist/face-api.js');
const util = require('util');

// Mock browser globals for face-api.js UMD build
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

async function test() {
    try {
        console.log('Setting backend to CPU...');
        await tf.setBackend('cpu');
        await tf.ready();
        console.log('Backend ready:', tf.getBackend());

        console.log('Loading models...');
        // We can use the path to the models in node_modules
        const modelPath = './node_modules/@vladmandic/face-api/model';
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        console.log('Model loaded successfully!');
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
