const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importPincodes() {
  try {
    console.log('🚀 Starting corrected pincode import...');
    
    // Clear existing data first
    await prisma.pincodeData.deleteMany({});
    console.log('✅ Cleared existing pincode data');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '../../../data/comprehensive_india_pincodes.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error('CSV file not found');
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header line
    const dataLines = lines.slice(1);
    console.log(`📊 Found ${dataLines.length} pincode records to import`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each line individually (no batching to avoid issues)
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      
      try {
        // Parse the line: pincode,city,district,state,area
        const fields = line.split(',').map(field => field.trim().replace(/"/g, ''));
        
        if (fields.length === 5) {
          const [pincode, city, district, state, area] = fields;
          
          // Validate required fields
          if (pincode && city && state && pincode.length === 6) {
            await prisma.pincodeData.create({
              data: {
                pincode,
                city,
                district,
                state,
                area: area || null
              }
            });
            successCount++;
            
            // Progress indicator
            if (successCount % 1000 === 0) {
              console.log(`📈 Processed ${successCount}/${dataLines.length} records...`);
            }
          } else {
            errorCount++;
            if (errorCount <= 5) {
              console.log(`⚠️ Skipping invalid line ${i + 1}: "${line}"`);
            }
          }
        } else {
          errorCount++;
          if (errorCount <= 5) {
            console.log(`⚠️ Skipping malformed line ${i + 1}: ${fields.length} fields - "${line}"`);
          }
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.log(`❌ Error processing line ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Pincode import completed!');
    console.log(`✅ Successfully imported: ${successCount} records`);
    if (errorCount > 0) {
      console.log(`⚠️ Errors/Skipped: ${errorCount} records`);
    }
    
    // Test the import
    console.log('\n🧪 Testing import...');
    const testPincode = await prisma.pincodeData.findMany({
      where: { pincode: '401303' }
    });
    
    if (testPincode.length > 0) {
      console.log(`✅ Test pincode 401303 found: ${testPincode[0].city}, ${testPincode[0].state}`);
    } else {
      console.log('❌ Test pincode 401303 not found');
    }
    
    const totalRecords = await prisma.pincodeData.count();
    console.log(`📊 Total records in database: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importPincodes()
  .then(() => {
    console.log('\n✅ All done!');
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });
