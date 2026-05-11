import sharp from 'sharp';

async function makeTransparent() {
  try {
    const { data, info } = await sharp('public/images/logo-cropped.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Loop through pixels and make white transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is very close to white, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // alpha
      }
    }

    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toFile('public/images/logo-transparent.png');
      
    console.log('Successfully created logo-transparent.png');
  } catch (err) {
    console.error('Error:', err);
  }
}

makeTransparent();
