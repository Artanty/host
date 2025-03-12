const fs = require('fs');
const path = require('path');

// Path to the .env file
const envFilePath = path.join(__dirname, '.env');

// Define conditions for "serve" and "build" configurations
const configurations = {
  serve: [
    {
      description: 'Uncomment line with FAQ_WEB_URL and localhost',
      test: (line) =>
        line.includes('FAQ_WEB_URL') &&
        line.includes('localhost') &&
        line.startsWith('#'), // Check if the line is commented
      action: (line) => line.replace(/^#\s*/, ''), // Uncomment the line
    },
    {
      description: 'Comment line with FAQ_WEB_URL and assets',
      test: (line) =>
        line.includes('FAQ_WEB_URL') &&
        line.includes('assets') &&
        !line.startsWith('#'), // Check if the line is not commented
      action: (line) => `# ${line}`, // Comment the line
    },
  ],
  build: [
    {
      description: 'Comment line with FAQ_WEB_URL and localhost',
      test: (line) =>
        line.includes('FAQ_WEB_URL') &&
        line.includes('localhost') &&
        !line.startsWith('#'), // Check if the line is not commented
      action: (line) => `# ${line}`, // Comment the line
    },
    {
      description: 'Uncomment line with FAQ_WEB_URL and assets',
      test: (line) =>
        line.includes('FAQ_WEB_URL') &&
        line.includes('assets') &&
        line.startsWith('#'), // Check if the line is commented
      action: (line) => line.replace(/^#\s*/, ''), // Uncomment the line
    },
  ],
};

// Get the configuration type from command-line arguments
const configType = process.argv[2]; // "serve" or "build"

if (!configType || !['serve', 'build'].includes(configType)) {
  console.error('Usage: node envReplace.js <serve|build>');
  process.exit(1);
}

// Get the conditions for the selected configuration
const conditions = configurations[configType];

// Read the .env file
fs.readFile(envFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading .env file:', err);
    return;
  }

  // Process the file content
  const updatedData = data
    .split('\n') // Split the file into lines
    .map((line) => {
      // Check each condition and apply the corresponding action
      for (const condition of conditions) {
        if (condition.test(line)) {
          console.log(`Applied action: ${condition.description}`);
          return condition.action(line);
        }
      }
      // Return the line unchanged if it doesn't match any condition
      return line;
    })
    .join('\n'); // Join the lines back into a single string

  // Write the updated content back to the .env file
  fs.writeFile(envFilePath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to .env file:', err);
      return;
    }
    console.log(`.env file updated for ${configType} configuration.`);
  });
});