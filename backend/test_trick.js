const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');

// Trick face-api into using regular tfjs instead of tfjs-node
module.constructor.prototype.require = (function(orig) {
    return function(name) {
        if (name === '@tensorflow/tfjs-node') return tf;
        return orig.apply(this, arguments);
    };
})(module.constructor.prototype.require);

const faceapi = require('@vladmandic/face-api');

async function test() {
    try {
        console.log('Setting backend to CPU...');
        await tf.setBackend('cpu');
        await tf.ready();
        console.log('Backend ready:', tf.getBackend());

        console.log('Loading models...');
        const modelPath = './node_modules/@vladmandic/face-api/model';
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        console.log('Model loaded successfully!');
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
