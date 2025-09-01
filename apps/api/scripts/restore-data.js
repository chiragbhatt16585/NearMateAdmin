const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('🚀 Starting data restoration...');

    // 1. Restore Categories
    console.log('\n📋 Step 1: Restoring Service Categories...');
    const categories = [
      { key: 'plumber', label: 'Plumber', icon: '🛠️', tone: '#E9EEF9', popular: false },
      { key: 'electrician', label: 'Electrician', icon: '🔌', tone: '#F4ECF7', popular: false },
      { key: 'carpenter', label: 'Carpenter', icon: '🪚', tone: '#F0F5F2', popular: false },
      { key: 'ac', label: 'AC Repair', icon: '❄️', tone: '#ECF6FB', popular: false },
      { key: 'salon', label: 'Salon at Home', icon: '💇‍♀️', tone: '#FEF3F2', popular: false },
      { key: 'tutor', label: 'Tutor', icon: '📚', tone: '#F8F1E7', popular: false },
      { key: 'cleaning', label: 'Cleaning', icon: '🧹', tone: '#F3F6EE', popular: false },
      { key: 'pest', label: 'Pest Control', icon: '🐜', tone: '#FDF6E7', popular: false },
      { key: 'painting', label: 'Painting', icon: '🎨', tone: '#EAF7F3', popular: false },
      { key: 'appliances', label: 'Appliance Repair', icon: '🧺', tone: '#F0F0FF', popular: false },
      { key: 'moving', label: 'Packers & Movers', icon: '📦', tone: '#FFF0F0', popular: false },
      { key: 'gardening', label: 'Gardening', icon: '🌿', tone: '#EAF6EA', popular: false },
      { key: 'carwash', label: 'Car Wash', icon: '🚗', tone: '#EAF3FB', popular: false },
      { key: 'laptop', label: 'Laptop Repair', icon: '💻', tone: '#F2F2F2', popular: false }
    ];

    for (const category of categories) {
      await prisma.serviceCategory.upsert({
        where: { key: category.key },
        update: category,
        create: category,
      });
    }
    console.log(`✅ Restored ${categories.length} service categories`);

    // 2. Restore Partners
    console.log('\n🤝 Step 2: Restoring Partners...');
    const partners = [
      {
        id: '1a44b107-9de0-4b36-a422-0e564f386cfe',
        name: 'John Doe',
        phone: '9990001111',
        email: 'john@example.com',
        status: 'active',
        loginId: 'JD000001'
      },
      {
        id: '618c60d3-f337-4264-926c-53f8b8b8b8b8',
        name: 'Jane Smith',
        phone: '9990002222',
        email: 'jane@example.com',
        status: 'active',
        loginId: 'JS000002'
      },
      {
        id: 'fea3c3f2-3b66-4ae1-b24a-b60b470ee41c',
        name: 'Mike Johnson',
        phone: '9990003333',
        email: 'mike@example.com',
        status: 'active',
        loginId: 'MJ000003'
      }
    ];

    for (const partner of partners) {
      await prisma.partner.upsert({
        where: { id: partner.id },
        update: partner,
        create: partner,
      });
    }
    console.log(`✅ Restored ${partners.length} partners`);

    // 3. Restore Partner Categories
    console.log('\n🔗 Step 3: Restoring Partner Categories...');
    
    // Get the actual category IDs from the database
    const plumberCategory = await prisma.serviceCategory.findUnique({ where: { key: 'plumber' } });
    const electricianCategory = await prisma.serviceCategory.findUnique({ where: { key: 'electrician' } });
    const paintingCategory = await prisma.serviceCategory.findUnique({ where: { key: 'painting' } });
    
    const partnerCategories = [
      { partnerId: '1a44b107-9de0-4b36-a422-0e564f386cfe', serviceCategoryId: plumberCategory.id }, // John Doe - Plumber
      { partnerId: '618c60d3-f337-4264-926c-53f8b8b8b8b8', serviceCategoryId: electricianCategory.id }, // Jane Smith - Electrician
      { partnerId: 'fea3c3f2-3b66-4ae1-b24a-b60b470ee41c', serviceCategoryId: paintingCategory.id }  // Mike Johnson - Painting
    ];

    for (const pc of partnerCategories) {
      // Check if this combination already exists
      const existing = await prisma.partnerCategory.findFirst({
        where: {
          partnerId: pc.partnerId,
          serviceCategoryId: pc.serviceCategoryId
        }
      });
      
      if (!existing) {
        await prisma.partnerCategory.create({
          data: pc
        });
      }
    }
    console.log(`✅ Restored ${partnerCategories.length} partner categories`);

    // 4. Restore Pincode Data
    console.log('\n📍 Step 4: Restoring Pincode Data...');
    
    let pincodeCount = 0;
    
    // Read the comprehensive pincode CSV file
    const pincodeFilePath = path.join(__dirname, '../../../data/comprehensive_india_pincodes.csv');
    if (fs.existsSync(pincodeFilePath)) {
      const csvContent = fs.readFileSync(pincodeFilePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // Skip header line
      const dataLines = lines.slice(1);
      
      console.log(`📊 Found ${dataLines.length} pincode records to import`);
      
      // Process in batches to avoid memory issues
      const batchSize = 1000;
      let processed = 0;
      
      for (let i = 0; i < dataLines.length; i += batchSize) {
        const batch = dataLines.slice(i, i + batchSize);
        
        for (const line of batch) {
          const [pincode, city, district, state, area] = line.split(',').map(field => field.trim().replace(/"/g, ''));
          
          if (pincode && city && state) {
            // Check if this pincode already exists
            const existing = await prisma.pincodeData.findFirst({
              where: { pincode }
            });
            
            if (!existing) {
              await prisma.pincodeData.create({
                data: { pincode, district, city, state, area: area || null }
              });
            }
          }
        }
        
        processed += batch.length;
        console.log(`📈 Processed ${processed}/${dataLines.length} pincode records...`);
      }
      
      pincodeCount = processed;
      console.log(`✅ Restored ${processed} pincode records`);
    } else {
      console.log('⚠️ Pincode CSV file not found, skipping pincode restoration');
    }

    // 5. Create some sample end users
    console.log('\n👤 Step 5: Creating Sample End Users...');
    const endUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '9990004444',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female',
        status: 'active'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '9990005555',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        status: 'active'
      },
      {
        name: 'Carol Brown',
        email: 'carol@example.com',
        phone: '9990006666',
        dateOfBirth: new Date('1992-12-20'),
        gender: 'female',
        status: 'active'
      }
    ];

    for (const userData of endUsers) {
      await prisma.endUser.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData,
      });
    }
    console.log(`✅ Created ${endUsers.length} sample end users`);

    console.log('\n🎉 Data restoration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Service Categories: ${categories.length}`);
    console.log(`   • Partners: ${partners.length}`);
    console.log(`   • Partner Categories: ${partnerCategories.length}`);
    console.log(`   • Pincode Records: ${pincodeCount || 'Skipped'}`);
    console.log(`   • Sample End Users: ${endUsers.length}`);
    
    console.log('\n🧪 Test your API endpoints:');
    console.log(`   • Categories: GET /api/v1/public/categories?api_key=YOUR_API_KEY`);
    console.log(`   • Pincode Lookup: GET /api/v1/public/pincode/lookup/400058?api_key=YOUR_API_KEY`);
    console.log(`   • Health Check: GET /api/v1/public/health?api_key=YOUR_API_KEY`);

  } catch (error) {
    console.error('❌ Error during data restoration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreData()
  .then(() => {
    console.log('\n✅ All done! Your database is now populated with sample data.');
  })
  .catch((error) => {
    console.error('💥 Data restoration failed:', error);
    process.exit(1);
  });
