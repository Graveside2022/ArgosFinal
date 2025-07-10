const { spawn } = require('child_process');
const _path = require('path');

console.log('Running ESLint check on all files...');

const eslint = spawn('npx', ['eslint', 'src/', '--ext', '.js,.ts,.svelte', '--format=json'], {
  cwd: __dirname,
  timeout: 120000 // 2 minutes
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
      
      // Count by rule type
      const ruleStats = {};
      results.forEach(result => {
        result.messages.forEach(msg => {
          const rule = msg.ruleId || 'null';
          ruleStats[rule] = (ruleStats[rule] || 0) + 1;
        });
      });
      
      console.log('\nTop error types:');
      Object.entries(ruleStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([rule, count]) => {
          console.log(`  ${rule}: ${count}`);
        });
      
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