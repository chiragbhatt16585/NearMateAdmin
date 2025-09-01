const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaQuery() {
  try {
    console.log('🧪 Testing exact Prisma query from service...\n');
    
    const testPincode = '401303';
    
    // Test the exact query from the service
    console.log(`🔍 Testing query: where: { pincode: '${testPincode}' }`);
    
    const records = await prisma.pincodeData.findMany({
      where: { pincode: testPincode },
      orderBy: [{ city: 'asc' }, { district: 'asc' }, { area: 'asc' }],
    });
    
    console.log(`✅ Query returned ${records.length} records:`);
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test with a different approach
    console.log(`\n🔍 Testing alternative query: where: { pincode: { equals: '${testPincode}' } }`);
    
    const records2 = await prisma.pincodeData.findMany({
      where: { pincode: { equals: testPincode } },
      orderBy: [{ city: 'asc' }, { district: 'asc' }, { area: 'asc' }],
    });
    
    console.log(`✅ Alternative query returned ${records2.length} records:`);
    records2.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test with raw SQL to see if there's a Prisma issue
    console.log(`\n🔍 Testing raw SQL query...`);
    
    const rawRecords = await prisma.$queryRaw`
      SELECT pincode, city, state, district, area 
      FROM PincodeData 
      WHERE pincode = ${testPincode}
      ORDER BY city ASC, district ASC, area ASC
    `;
    
    console.log(`✅ Raw SQL query returned ${rawRecords.length} records:`);
    rawRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.pincode} - ${record.city}, ${record.state}`);
    });
    
    // Test if there's a data type issue
    console.log(`\n🔍 Testing data type...`);
    const sampleRecord = await prisma.pincodeData.findFirst();
    if (sampleRecord) {
      console.log(`Sample record pincode type: ${typeof sampleRecord.pincode}`);
      console.log(`Sample record pincode value: "${sampleRecord.pincode}"`);
      console.log(`Sample record pincode length: ${sampleRecord.pincode.length}`);
      console.log(`Sample record pincode bytes: ${Buffer.from(sampleRecord.pincode).toString('hex')}`);
    }
    
  } catch (error) {
    console.error('❌ Error during Prisma test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPrismaQuery()
  .then(() => {
    console.log('\n✅ Prisma test completed!');
  })
  .catch((error) => {
    console.error('💥 Prisma test failed:', error);
    process.exit(1);
  });
