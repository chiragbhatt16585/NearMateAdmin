const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleEndUsers() {
  try {
    console.log('🔄 Creating sample end users...');

    // Create sample end users
    const endUser1 = await prisma.endUser.create({
      data: {
        email: 'rahul.kumar@example.com',
        phone: '9876543210',
        name: 'Rahul Kumar',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        status: 'active'
      }
    });

    const endUser2 = await prisma.endUser.create({
      data: {
        email: 'priya.sharma@example.com',
        phone: '9876543211',
        name: 'Priya Sharma',
        dateOfBirth: new Date('1992-08-22'),
        gender: 'female',
        status: 'active'
      }
    });

    const endUser3 = await prisma.endUser.create({
      data: {
        email: 'amit.patel@example.com',
        phone: '9876543212',
        name: 'Amit Patel',
        dateOfBirth: new Date('1988-12-10'),
        gender: 'male',
        status: 'active'
      }
    });

    console.log('✅ Created end users:', [endUser1.name, endUser2.name, endUser3.name]);

    // Create addresses for end users
    const address1 = await prisma.endUserAddress.create({
      data: {
        endUserId: endUser1.id,
        type: 'home',
        label: 'Home',
        area: 'A-204, Gokul Park, Opp-Dmart',
        pincode: '401303',
        city: 'Virar',
        state: 'Maharashtra',
        country: 'India',
        lat: 19.4556,
        lng: 72.8122,
        isDefault: true,
        isActive: true
      }
    });

    const address2 = await prisma.endUserAddress.create({
      data: {
        endUserId: endUser1.id,
        type: 'office',
        label: 'Office',
        area: 'B-15, Tech Park, Andheri West',
        pincode: '400058',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        lat: 19.1197,
        lng: 72.8464,
        isDefault: false,
        isActive: true
      }
    });

    const address3 = await prisma.endUserAddress.create({
      data: {
        endUserId: endUser2.id,
        type: 'home',
        label: 'Home',
        area: 'C-45, Sunshine Apartments',
        pincode: '382346',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        lat: 23.0225,
        lng: 72.5714,
        isDefault: true,
        isActive: true
      }
    });

    const address4 = await prisma.endUserAddress.create({
      data: {
        endUserId: endUser3.id,
        type: 'home',
        label: 'Home',
        area: 'D-12, Green Valley Society',
        pincode: '560001',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        lat: 12.9716,
        lng: 77.5946,
        isDefault: true,
        isActive: true
      }
    });

    console.log('✅ Created addresses for end users');
    console.log('📍 Addresses created:', [address1.area, address2.area, address3.area, address4.area]);

    // Create some sample bookings
    const booking1 = await prisma.endUserBooking.create({
      data: {
        endUserId: endUser1.id,
        partnerId: (await prisma.partner.findFirst()).id,
        categoryId: (await prisma.serviceCategory.findFirst()).id,
        serviceDescription: 'House cleaning service needed',
        scheduledDate: new Date('2025-08-26'),
        scheduledTime: '10:00 AM',
        status: 'pending',
        priority: 'normal',
        addressId: address1.id,
        quotedPrice: 1500,
        paymentStatus: 'pending'
      }
    });

    console.log('✅ Created sample booking for end user');

    console.log('\n🎉 Sample data created successfully!');
    console.log('📊 Summary:');
    console.log('- End Users: 3');
    console.log('- Addresses: 4');
    console.log('- Bookings: 1');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleEndUsers();
