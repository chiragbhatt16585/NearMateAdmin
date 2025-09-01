const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPincodeImport() {
  try {
    console.log('🧪 Testing pincode import with simple data...');
    
    // Clear existing data first
    await prisma.pincodeData.deleteMany({});
    console.log('✅ Cleared existing pincode data');
    
    // Import just 5 test records manually
    const testRecords = [
      {
        pincode: '401303',
        district: 'Palghar',
        city: 'Virar',
        state: 'Maharashtra',
        area: 'Virar West'
      },
      {
        pincode: '401301',
        district: 'Palghar',
        city: 'Virar',
        state: 'Maharashtra',
        area: 'Virar East'
      },
      {
        pincode: '400001',
        district: 'Mumbai City',
        city: 'Mumbai',
        state: 'Maharashtra',
        area: 'Fort'
      },
      {
        pincode: '400002',
        district: 'Mumbai City',
        city: 'Mumbai',
        state: 'Maharashtra',
        area: 'Churchgate'
      },
      {
        pincode: '110001',
        district: 'New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        area: 'Connaught Place'
      }
    ];
    
    for (const record of testRecords) {
      await prisma.pincodeData.create({
        data: record
      });
      console.log(`✅ Created: ${record.pincode} - ${record.city}, ${record.state}`);
    }
    
    console.log('\n🧪 Testing lookup endpoints...');
    
    // Test lookup
    const lookupResult = await prisma.pincodeData.findMany({
      where: { pincode: '401303' }
    });
    
    console.log(`\n🔍 Lookup for 401303 returned ${lookupResult.length} records:`);
    lookupResult.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test search
    const searchResult = await prisma.pincodeData.findMany({
      where: {
        OR: [
          { pincode: { startsWith: '401' } },
          { city: { contains: 'Virar' } }
        ]
      },
      take: 5
    });
    
    console.log(`\n🔍 Search for '401' or 'Virar' returned ${searchResult.length} records:`);
    searchResult.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
  } catch (error) {
    console.error('❌ Error during test import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPincodeImport()
  .then(() => {
    console.log('\n✅ Test import completed!');
  })
  .catch((error) => {
    console.error('💥 Test import failed:', error);
    process.exit(1);
  });
