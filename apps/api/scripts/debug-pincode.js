const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '../../../data/comprehensive_india_pincodes.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

console.log('🔍 Debugging CSV parsing...\n');

// Show first few lines
const lines = csvContent.split('\n').filter(line => line.trim());
console.log('📊 First 5 lines:');
lines.slice(0, 5).forEach((line, index) => {
  console.log(`Line ${index + 1}: "${line}"`);
  const fields = line.split(',').map(field => field.trim().replace(/"/g, ''));
  console.log(`  Parsed: [${fields.map(f => `"${f}"`).join(', ')}]`);
  console.log('');
});

// Test specific pincode parsing
console.log('🎯 Testing pincode 401303 parsing:');
const targetLine = lines.find(line => line.includes('401303'));
if (targetLine) {
  console.log(`Found line: "${targetLine}"`);
  const fields = targetLine.split(',').map(field => field.trim().replace(/"/g, ''));
  console.log(`Parsed fields: [${fields.map(f => `"${f}"`).join(', ')}]`);
  
  // Check if there are any hidden characters
  console.log('\n🔍 Character analysis:');
  console.log(`Raw line length: ${targetLine.length}`);
  console.log(`Raw line bytes: ${Buffer.from(targetLine).toString('hex')}`);
  
  // Check each field
  fields.forEach((field, index) => {
    console.log(`Field ${index}: "${field}" (length: ${field.length})`);
    if (field.length > 0) {
      console.log(`  Bytes: ${Buffer.from(field).toString('hex')}`);
    }
  });
} else {
  console.log('❌ Pincode 401303 not found in CSV');
}

// Check for any lines with wrong number of fields
console.log('\n🔍 Checking for malformed lines:');
let malformedCount = 0;
lines.forEach((line, index) => {
  const fields = line.split(',');
  if (fields.length !== 5) {
    malformedCount++;
    if (malformedCount <= 5) {
      console.log(`Line ${index + 1}: ${fields.length} fields - "${line}"`);
    }
  }
});

if (malformedCount > 0) {
  console.log(`⚠️ Found ${malformedCount} malformed lines`);
} else {
  console.log('✅ All lines have correct number of fields');
}
