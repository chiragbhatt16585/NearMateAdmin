const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupFirstUser() {
  try {
    console.log('🚀 Setting up first user and API key...');

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@nearmate.local' }
    });

    if (existingUser) {
      console.log('✅ Admin user already exists');
      return existingUser;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@nearmate.local',
        name: 'Admin User',
        hashedPassword: hashedPassword,
        role: 'admin',
        status: 'active'
      }
    });

    console.log('✅ Admin user created:', user.email);

    // Create a default API key for public access
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: 'Default Public API Key',
        key: generateApiKey(),
        permissions: ['categories', 'pincodes', 'public'],
        isActive: true
      }
    });

    console.log('✅ Default API key created');
    console.log('🔑 API Key:', apiKey.key);
    console.log('📋 Permissions:', apiKey.permissions.join(', '));

    return user;
  } catch (error) {
    console.error('❌ Error setting up user:', error);
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
setupFirstUser()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('📖 Next steps:');
    console.log('1. Login with admin@nearmate.local / admin123');
    console.log('2. Use the API key above for public API access');
    console.log('3. Test public endpoints: /api/v1/public/categories');
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
