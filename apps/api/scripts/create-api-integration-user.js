const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createApiIntegrationUser() {
  try {
    console.log('🚀 Creating API Integration User...');

    // Check if API integration user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'api@nearmate.local' }
    });

    if (existingUser) {
      console.log('✅ API Integration user already exists');
      return existingUser;
    }

    // Create API integration user
    const hashedPassword = await bcrypt.hash('api123456', 10);
    const user = await prisma.user.create({
      data: {
        email: 'api@nearmate.local',
        name: 'API Integration User',
        hashedPassword: hashedPassword,
        role: 'api_integration',
        status: 'active'
      }
    });

    console.log('✅ API Integration user created:', user.email);
    console.log('👤 User ID:', user.id);
    console.log('🔐 Password: api123456');

    // Create API key for integration
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: 'API Integration Key',
        key: generateApiKey(),
        permissions: [
          'categories:read',
          'pincodes:read', 
          'partners:read',
          'end-users:read',
          'bookings:read',
          'public:read'
        ],
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    console.log('✅ API Integration key created');
    console.log('🔑 API Key:', apiKey.key);
    console.log('📋 Permissions:', apiKey.permissions.join(', '));
    console.log('⏰ Expires:', apiKey.expiresAt);

    return { user, apiKey };
  } catch (error) {
    console.error('❌ Error creating API integration user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateApiKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
}

// Run the setup
createApiIntegrationUser()
  .then(({ user, apiKey }) => {
    console.log('');
    console.log('🎉 API Integration User Setup Completed Successfully!');
    console.log('');
    console.log('📖 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: api123456`);
    console.log(`   Role: ${user.role}`);
    console.log('');
    console.log('🔑 API Key Details:');
    console.log(`   Key: ${apiKey.key}`);
    console.log(`   Permissions: ${apiKey.permissions.join(', ')}`);
    console.log(`   Expires: ${apiKey.expiresAt}`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Use this API key for all API integration calls');
    console.log('2. Keep the API key secure and don\'t share it');
    console.log('3. Test the API endpoints with this key');
    console.log('4. Update your integration code to use this key instead of admin credentials');
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
