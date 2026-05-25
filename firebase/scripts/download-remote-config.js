const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'vertexai-firebase-6a64f';
const OUTPUT_FILE = path.join(__dirname, '../remote_config_defaults.json');

try {
  console.log(`Fetching Remote Config template for project: ${PROJECT_ID}...`);

  // Execute firebase CLI command to get the template
  const stdout = execSync(`firebase remoteconfig:get --project ${PROJECT_ID} --json`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  const response = JSON.parse(stdout);
  const template = response.result;

  if (!template || !template.parameters) {
    throw new Error('No parameters found in Remote Config template.');
  }

  // Parse parameters into a flat key/value map
  const defaults = {};
  Object.keys(template.parameters).forEach((key) => {
    const param = template.parameters[key];
    if (param.defaultValue && param.defaultValue.value !== undefined) {
      defaults[key] = param.defaultValue.value;
    }
  });

  // Ensure output directory exists
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the simplified defaults to the output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(defaults, null, 2), 'utf8');

  console.log(`✅ Successfully generated simplified defaults at: ${OUTPUT_FILE}`);
} catch (error) {
  console.error('❌ Failed to download or parse Remote Config:', error.message);
  process.exit(1);
}
