/**
 * downloadFaceModels.js
 * Run once with: node scripts/downloadFaceModels.js
 * Downloads face-api.js model weights from the official vladmandic CDN.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_DIR = path.join(__dirname, '../face-api-models');

// Official CDN for vladmandic/face-api model weights (avoids GitHub LFS issues)
const BASE_URL = 'https://vladmandic.github.io/face-api/model';

const MODEL_FILES = [
    // Face Detection (SSD MobileNetV1)
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    // Face Landmarks (68 points)
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    // Face Recognition (128-d descriptor)
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) {
            const size = fs.statSync(dest).size;
            if (size > 1000) { // Skip if file already exists and is non-trivial size
                console.log(`  [SKIP] Already exists: ${path.basename(dest)}`);
                return resolve();
            }
            fs.unlinkSync(dest); // Delete tiny/corrupt placeholder
        }

        const file = fs.createWriteStream(dest);

        const makeRequest = (reqUrl, redirectCount = 0) => {
            if (redirectCount > 5) {
                file.close();
                return reject(new Error(`Too many redirects for ${path.basename(dest)}`));
            }

            https.get(reqUrl, { headers: { 'User-Agent': 'node-face-api-downloader' } }, (res) => {
                // Follow redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    return makeRequest(res.headers.location, redirectCount + 1);
                }

                if (res.statusCode !== 200) {
                    file.close();
                    if (fs.existsSync(dest)) fs.unlinkSync(dest);
                    return reject(new Error(`HTTP ${res.statusCode} for ${path.basename(dest)}`));
                }

                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const size = (fs.statSync(dest).size / 1024).toFixed(1);
                    console.log(`  [OK] ${path.basename(dest)} (${size} KB)`);
                    resolve();
                });
                file.on('error', (err) => {
                    if (fs.existsSync(dest)) fs.unlinkSync(dest);
                    reject(err);
                });
            }).on('error', (err) => {
                file.close();
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                reject(err);
            });
        };

        makeRequest(url);
    });
};

const main = async () => {
    if (!fs.existsSync(MODEL_DIR)) {
        fs.mkdirSync(MODEL_DIR, { recursive: true });
    }

    console.log(`\n📦 Downloading face-api.js model weights to:\n   ${MODEL_DIR}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const file of MODEL_FILES) {
        const url = `${BASE_URL}/${file}`;
        const dest = path.join(MODEL_DIR, file);
        try {
            await downloadFile(url, dest);
            successCount++;
        } catch (err) {
            console.error(`  [ERROR] ${file}: ${err.message}`);
            failCount++;
        }
    }

    console.log(`\n${failCount === 0 ? '✅' : '⚠️'} Done! ${successCount} downloaded, ${failCount} failed.`);
    if (failCount > 0) {
        console.log('   Re-run this script to retry failed downloads.');
    }
};

main();
