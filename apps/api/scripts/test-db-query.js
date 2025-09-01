const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDbQuery() {
  try {
    console.log('🧪 Testing database queries directly...\n');
    
    // Test 1: Count total records
    const totalCount = await prisma.pincodeData.count();
    console.log(`📊 Total records in database: ${totalCount}`);
    
    // Test 2: Find specific pincode
    const specificPincode = await prisma.pincodeData.findMany({
      where: { pincode: '401303' }
    });
    console.log(`\n🔍 Records for pincode 401303: ${specificPincode.length}`);
    specificPincode.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test 3: Find first few records
    const firstRecords = await prisma.pincodeData.findMany({
      take: 5,
      orderBy: { pincode: 'asc' }
    });
    console.log(`\n🔍 First 5 records:`);
    firstRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test 4: Check if there are any records with wrong pincode format
    const wrongFormat = await prisma.pincodeData.findMany({
      where: {
        pincode: {
          not: {
            startsWith: '4' // Should start with 4 for Mumbai area
          }
        }
      },
      take: 5
    });
    console.log(`\n🔍 Records not starting with '4': ${wrongFormat.length}`);
    wrongFormat.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test 5: Check for any records with pincode length != 6
    const wrongLength = await prisma.pincodeData.findMany({
      where: {
        pincode: {
          not: {
            equals: '401303'
          }
        }
      },
      take: 5
    });
    console.log(`\n🔍 Records not equal to '401303': ${wrongLength.length}`);
    wrongLength.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
  } catch (error) {
    console.error('❌ Error during database test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDbQuery()
  .then(() => {
    console.log('\n✅ Database test completed!');
  })
  .catch((error) => {
    console.error('💥 Database test failed:', error);
    process.exit(1);
  });
