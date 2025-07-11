#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the MissionControl.svelte file
const filePath = path.join(__dirname, 'src/lib/components/drone/MissionControl.svelte');
const content = fs.readFileSync(filePath, 'utf8');

// Check for common TypeScript issues
const checks = [
  { pattern: /: any\b/, message: 'Explicit any type found' },
  { pattern: /as any(?!\.L as typeof L)/, message: 'Unsafe type assertion to any found' },
  { pattern: /\w+\s*\?\.\w+\s*\?\.\w+/, message: 'Complex optional chaining found' },
  { pattern: /window\s*\.\w+\s*\.\w+/, message: 'Unsafe window property access' },
  { pattern: /import.*from.*'svelte\/transition'.*fade/, message: 'Unused fade import' }
];

// Define safe patterns that should not be counted as issues
const safePatterns = [
  /\(window as any\)\.L as typeof L/,  // Safe Leaflet access
  /\(event\.target as L\.Marker\)/,     // Safe marker type assertion
  /\(layer as L\.\w+\)/                // Safe layer type assertion
];

let issueCount = 0;
const lines = content.split('\n');

checks.forEach(({ pattern, message }) => {
  const matches = content.match(new RegExp(pattern, 'g'));
  if (matches) {
    // Filter out safe patterns
    const problematicMatches = matches.filter(match => {
      return !safePatterns.some(safePattern => safePattern.test(match));
    });
    
    if (problematicMatches.length > 0) {
      console.log(`Issue: ${message} (${problematicMatches.length} occurrences)`);
      issueCount += problematicMatches.length;
      
      // Show line numbers for problematic matches
      lines.forEach((line, index) => {
        if (pattern.test(line) && !safePatterns.some(safePattern => safePattern.test(line))) {
          console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
});

console.log(`\nTotal issues found: ${issueCount}`);
process.exit(issueCount > 0 ? 1 : 0);