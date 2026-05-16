const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');

// Trick face-api into using regular tfjs instead of tfjs-node
// This allows us to use the node-optimized build of face-api without the native binary dependency
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(name) {
    if (name === '@tensorflow/tfjs-node') return tf;
    return originalRequire.apply(this, arguments);
};

const faceapi = require('@vladmandic/face-api');
const { Jimp } = require('jimp');
const path = require('path');

// Models are bundled in the npm package
const MODEL_PATH = path.join(
    __dirname,
    '../node_modules/@vladmandic/face-api/model'
);

let modelsLoaded = false;

/**
 * Loads the required neural networks.
 */
const loadModels = async () => {
    if (modelsLoaded) return;

    console.log('🔄 Loading Face-API models (Pure JS/CPU)...');
    await tf.setBackend('cpu');
    await tf.ready();

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH); // Fallback detector
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);

    modelsLoaded = true;
    console.log('✅ Face-API models loaded.');
};

/**
 * Converts Jimp image to TensorFlow tensor.
 */
const jimpToTensor = (jimpImg) => {
    const { width, height, data } = jimpImg.bitmap; // data is a Buffer (RGBA)
    // Create a Uint8Array for the RGB values
    const numPixels = width * height;
    const rgbValues = new Uint8Array(numPixels * 3);
    for (let i = 0; i < numPixels; i++) {
        rgbValues[i * 3] = data[i * 4];     // R
        rgbValues[i * 3 + 1] = data[i * 4 + 1]; // G
        rgbValues[i * 3 + 2] = data[i * 4 + 2]; // B
    }
    return tf.tensor3d(rgbValues, [height, width, 3], 'int32');
};

/**
 * Extracts a 128-dimensional face embedding from a base64-encoded image.
 * @param {string} imageBase64 - Raw base64 string
 * @returns {Promise<number[] | null>} 128 floats, or null if no face detected
 */
const extractFaceEmbedding = async (imageBase64) => {
    await loadModels();

    let tensor;
    try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const jimpImg = await Jimp.read(buffer);

        // Resize for faster processing if too large
        if (jimpImg.bitmap.width > 640) {
            jimpImg.resize(640, Jimp.AUTO);
        }

        console.log(`Processing image: ${jimpImg.bitmap.width}x${jimpImg.bitmap.height}`);

        tensor = jimpToTensor(jimpImg);
        
        // Ensure tensor is the right type (float32 is often safer for descriptors)
        const floatTensor = tf.cast(tensor, 'float32');

        console.log(`[FaceAPI] Tensor ready: ${floatTensor.shape} | Type: ${floatTensor.dtype}`);

        // Try with main detector first (SsdMobilenetv1)
        let detection = await faceapi
            .detectSingleFace(floatTensor, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        // If failed, try with TinyFaceDetector
        if (!detection) {
            console.log('Main detector failed, trying TinyFaceDetector fallback...');
            detection = await faceapi
                .detectSingleFace(floatTensor, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
                .withFaceLandmarks()
                .withFaceDescriptor();
        }

        // Cleanup intermediate tensor
        floatTensor.dispose();

        if (!detection) {
            console.log('No face detected with any detector.');
            return null;
        }

        console.log('Face detected successfully!');
        return Array.from(detection.descriptor);
    } catch (error) {
        console.error('CRITICAL: Face processing error details:', error.message || error);
        throw error;
    } finally {
        if (tensor) {
            tensor.dispose();
        }
    }
};

/**
 * Compares two 128-d face embeddings using Euclidean distance.
 * @param {number[]} e1 
 * @param {number[]} e2 
 * @returns {number} Distance (lower is more similar)
 */
const compareEmbeddings = (e1, e2) => {
    if (!e1 || !e2 || e1.length !== e2.length) return 1.0;
    let sum = 0;
    for (let i = 0; i < e1.length; i++) {
        sum += (e1[i] - e2[i]) ** 2;
    }
    return Math.sqrt(sum);
};

module.exports = { extractFaceEmbedding, loadModels, compareEmbeddings };
