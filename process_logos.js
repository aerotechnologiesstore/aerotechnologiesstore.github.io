const jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const inputImagePath = 'C:/Users/aashu/.gemini/antigravity/brain/0b653757-5584-436e-8f26-890423679209/.user_uploaded/media__1784285074593.jpg';
const outputDir = path.join(__dirname, 'public', 'logos');

async function processLogos() {
  try {
    // Jimp v1 handles imports differently. Try different ways to access read.
    const read = jimp.read || jimp.Jimp?.read || jimp.default?.read;
    if (!read) {
       console.log('Could not find Jimp read function. Just copying the files instead.');
       fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-orange.png'));
       fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-blue.png'));
       fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-purple.png'));
       fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-rocket.png'));
       return;
    }
    
    const image = await read(inputImagePath);
    
    // Save base orange version
    await image.writeAsync(path.join(outputDir, 'logo-orange.png'));
    console.log('Saved logo-orange.png');
    
    // Blue version
    const blueImage = image.clone();
    blueImage.color([{ apply: 'hue', params: [170] }]);
    await blueImage.writeAsync(path.join(outputDir, 'logo-blue.png'));
    console.log('Saved logo-blue.png');
    
    // Purple version
    const purpleImage = image.clone();
    purpleImage.color([{ apply: 'hue', params: [240] }]);
    await purpleImage.writeAsync(path.join(outputDir, 'logo-purple.png'));
    console.log('Saved logo-purple.png');
    
    // Rocket (Gold) version
    const goldImage = image.clone();
    goldImage.color([{ apply: 'hue', params: [35] }]);
    await goldImage.writeAsync(path.join(outputDir, 'logo-rocket.png'));
    console.log('Saved logo-rocket.png');
    
    console.log('All logos generated successfully!');
  } catch (err) {
    console.error('Error processing logos:', err);
    // Fallback: just copy the files if image processing fails
    console.log('Falling back to direct copy...');
    fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-orange.png'));
    fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-blue.png'));
    fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-purple.png'));
    fs.copyFileSync(inputImagePath, path.join(outputDir, 'logo-rocket.png'));
  }
}

processLogos();
