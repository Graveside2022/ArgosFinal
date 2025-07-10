const { spawn } = require('child_process');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/components/drone/MissionControl.svelte');

console.log('Running ESLint check...');

const eslint = spawn('npx', ['eslint', filePath, '--format=json'], {
  cwd: __dirname,
  timeout: 30000
});

let output = '';
let errorOutput = '';

eslint.stdout.on('data', (data) => {
  output += data.toString();
});

eslint.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

eslint.on('close', (_code) => {
  if (output) {
    try {
      const results = JSON.parse(output);
      const errorCount = results.reduce((total, result) => total + result.errorCount, 0);
      const warningCount = results.reduce((total, result) => total + result.warningCount, 0);
      
      console.log(`ESLint Results:`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Warnings: ${warningCount}`);
      console.log(`Total issues: ${errorCount + warningCount}`);
      
      if (results.length > 0 && results[0].messages.length > 0) {
        console.log('\nFirst few messages:');
        results[0].messages.slice(0, 5).forEach(msg => {
          console.log(`  Line ${msg.line}: ${msg.message} (${msg.ruleId})`);
        });
      }
    } catch {
      console.log('Failed to parse ESLint output');
      console.log('Output:', output);
      console.log('Error output:', errorOutput);
    }
  } else {
    console.log('ESLint timed out or failed');
    console.log('Error output:', errorOutput);
  }
});

eslint.on('error', (err) => {
  console.log('ESLint process error:', err.message);
});