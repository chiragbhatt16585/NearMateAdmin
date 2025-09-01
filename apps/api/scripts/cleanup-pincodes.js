const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupPincodes() {
  try {
    console.log('🧹 Cleaning up corrupted pincode data...');
    
    // Delete all existing pincode data
    const deleteResult = await prisma.pincodeData.deleteMany({});
    
    console.log(`✅ Deleted ${deleteResult.count} corrupted pincode records`);
    console.log('🔄 Now you can run the restore script again to import clean data');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupPincodes()
  .then(() => {
    console.log('\n✅ Cleanup completed!');
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
