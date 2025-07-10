const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/components/drone/MissionControl.svelte');
const content = fs.readFileSync(filePath, 'utf8');

// Count problematic patterns
let issues = 0;
const lines = content.split('\n');

// Check for explicit any types (: any)
const explicitAnyMatches = content.match(/:\s*any\b/g);
if (explicitAnyMatches) {
  console.log(`Explicit any types: ${explicitAnyMatches.length}`);
  issues += explicitAnyMatches.length;
}

// Check for unsafe any assertions (not including safe Leaflet access)
lines.forEach((line, index) => {
  if (line.includes('as any') && !line.includes('(window as any).L as typeof L')) {
    console.log(`Line ${index + 1}: Unsafe any assertion: ${line.trim()}`);
    issues++;
  }
});

console.log(`\nTotal TypeScript issues: ${issues}`);
process.exit(issues > 0 ? 1 : 0);