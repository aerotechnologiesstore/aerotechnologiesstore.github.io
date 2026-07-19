const Jimp = require('jimp');
const path = require('path');

const logosDir = path.join(__dirname, 'public', 'logos');
const filesToProcess = [
  'logo-orange-v2.png',
  'logo-blue-v2.png',
  'logo-purple-v2.png',
  'logo-rocket-v2.png'
];

async function processLogos() {
  for (const file of filesToProcess) {
    try {
      const filePath = path.join(logosDir, file);
      const image = await Jimp.read(filePath);
      
      // Make it a perfect square first if it isn't, but assuming they are roughly square
      const size = Math.min(image.bitmap.width, image.bitmap.height);
      
      // Center crop to a square
      image.cover(size, size);
      
      // Apply circular mask (transparent outside the circle)
      image.circle({ radius: size / 2, x: size / 2, y: size / 2 });
      
      // Overwrite the original v2 file with the transparent circular one
      await image.writeAsync(filePath);
      console.log(`Successfully cropped ${file} into a circle.`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
}

processLogos();
