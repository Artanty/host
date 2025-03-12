const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Paths for background.template.js
const inputFile = path.join(__dirname, 'src', 'assets', 'background.template.js');
const outputFile = path.join(__dirname, 'dist', 'web-host', 'background.js');

// Paths for manifest.json
const manifestSrc = path.join(__dirname, 'src', 'assets', 'manifest.json');
const manifestDest = path.join(__dirname, 'dist', 'web-host', 'manifest.json');

// Ensure the destination directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Copy manifest.json
const copyManifest = () => {
  ensureDirExists(path.dirname(manifestDest)); // Ensure the destination directory exists

  fs.copyFile(manifestSrc, manifestDest, (err) => {
    if (err) {
      console.error('Error copying manifest.json:', err);
    } else {
      console.log('manifest.json successfully copied to:', manifestDest);
    }
  });
};

// Remove files from dist/assets
const removeFiles = () => {
  const filesToRemove = [
    path.join(__dirname, 'dist', 'web-host', 'assets', 'background.template.js'),
    path.join(__dirname, 'dist', 'web-host', 'assets', 'manifest.json'),
  ];

  filesToRemove.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlink(file, (err) => {
        if (err) {
          console.error(`Error removing ${file}:`, err);
        } else {
          console.log(`Successfully removed ${file}`);
        }
      });
    } else {
      console.log(`${file} does not exist, skipping removal.`);
    }
  });
};

// Process background.template.js
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Replace the placeholder with the environment variable
  let replacedData = data.replace(/STAT_BACK_URL_PLACEHOLDER/g, process.env.STAT_BACK_URL);
  replacedData = replacedData.replace(/FAQ_BACK_URL_PLACEHOLDER/g, process.env.FAQ_BACK_URL);
  replacedData = replacedData.replace(/PROJECT_ID_PLACEHOLDER/g, process.env.PROJECT_ID);
  replacedData = replacedData.replace(/NAMESPACE_PLACEHOLDER/g, process.env.NAMESPACE);
  replacedData = replacedData.replace(/SLAVE_REPO_PLACEHOLDER/g, process.env.SLAVE_REPO);
  replacedData = replacedData.replace(/COMMIT_PLACEHOLDER/g, process.env.COMMIT);

  // Write the modified content to the output file
  fs.writeFile(outputFile, replacedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing the file:', err);
    } else {
      console.log('File successfully processed and saved to:', outputFile);
      // Copy manifest.json after background.js is processed
      copyManifest();
      // Remove unnecessary files after all operations are complete
      removeFiles();
    }
  });
});