const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importPincodeData() {
  try {
    console.log('🚀 Starting pincode data import...');
    
    // Read the SQL file
    const sqlFilePath = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'pincode.sql');
    console.log(`📁 Reading SQL file from: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Pincode SQL file not found in Downloads folder');
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📊 SQL file size: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Parse INSERT statements
    const insertRegex = /INSERT INTO table_name\([^)]+\)\s*VALUES\s*\(([^)]+)\)/gi;
    const matches = [...sqlContent.matchAll(insertRegex)];
    
    console.log(`🔍 Found ${matches.length} INSERT statements`);
    
    if (matches.length === 0) {
      throw new Error('No INSERT statements found in the SQL file');
    }
    
    // Check if data already exists
    const existingCount = await prisma.pincodeData.count();
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} pincode records`);
      const response = await askQuestion('Do you want to clear existing data and reimport? (y/N): ');
      if (response.toLowerCase() !== 'y') {
        console.log('❌ Import cancelled');
        return;
      }
      
      console.log('🗑️  Clearing existing pincode data...');
      await prisma.pincodeData.deleteMany({});
      console.log('✅ Existing data cleared');
    }
    
    // Process and insert data
    console.log('📥 Processing and inserting pincode data...');
    
    const batchSize = 1000;
    let processed = 0;
    let inserted = 0;
    
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      const pincodeData = [];
      
      for (const match of batch) {
        try {
          // Extract values from the INSERT statement
          const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
          
          if (values.length >= 5) {
            const [postOfficeName, pincode, city, district, state] = values;
            
            // Skip if pincode is not a valid number
            if (isNaN(pincode) || pincode.length !== 6) {
              continue;
            }
            
            pincodeData.push({
              pincode: pincode.toString(),
              district: district || '',
              city: city || '',
              state: state || '',
              area: postOfficeName || null
            });
          }
        } catch (error) {
          console.warn(`⚠️  Skipping invalid record: ${error.message}`);
          continue;
        }
      }
      
      if (pincodeData.length > 0) {
        try {
          await prisma.pincodeData.createMany({
            data: pincodeData,
            skipDuplicates: true
          });
          
          inserted += pincodeData.length;
          processed += batch.length;
          
          // Progress update
          const progress = ((i + batch.length) / matches.length * 100).toFixed(1);
          console.log(`📈 Progress: ${progress}% (${processed}/${matches.length} processed, ${inserted} inserted)`);
          
        } catch (error) {
          console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        }
      }
    }
    
    // Final count
    const finalCount = await prisma.pincodeData.count();
    console.log('');
    console.log('🎉 Pincode data import completed!');
    console.log(`📊 Total records processed: ${processed}`);
    console.log(`✅ Total records inserted: ${inserted}`);
    console.log(`🗄️  Total records in database: ${finalCount}`);
    
    // Sample data verification
    console.log('');
    console.log('🔍 Sample data verification:');
    const sampleData = await prisma.pincodeData.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    sampleData.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.area || 'N/A'} (${record.city}, ${record.district}, ${record.state})`);
    });
    
  } catch (error) {
    console.error('❌ Error importing pincode data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run the import
if (require.main === module) {
  importPincodeData()
    .then(() => {
      console.log('');
      console.log('✅ Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importPincodeData };
