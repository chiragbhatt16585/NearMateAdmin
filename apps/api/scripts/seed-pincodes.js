const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample Indian pincode data (major cities)
const pincodeData = [
  // Mumbai
  { pincode: '400001', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Fort' },
  { pincode: '400002', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Churchgate' },
  { pincode: '400003', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Colaba' },
  { pincode: '400004', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Cuffe Parade' },
  { pincode: '400005', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Girgaon' },
  { pincode: '400006', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Grant Road' },
  { pincode: '400007', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Gamdevi' },
  { pincode: '400008', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Girgaum' },
  { pincode: '400009', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Byculla' },
  { pincode: '400010', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Mazgaon' },
  { pincode: '400011', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Dadar' },
  { pincode: '400012', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Parel' },
  { pincode: '400013', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Sewri' },
  { pincode: '400014', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Wadala' },
  { pincode: '400015', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Sion' },
  { pincode: '400016', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Matunga' },
  { pincode: '400017', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Dharavi' },
  { pincode: '400018', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Mahim' },
  { pincode: '400019', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bandra West' },
  { pincode: '400020', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bandra East' },
  { pincode: '400021', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Santacruz West' },
  { pincode: '400022', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Santacruz East' },
  { pincode: '400023', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vile Parle West' },
  { pincode: '400024', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vile Parle East' },
  { pincode: '400025', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Andheri West' },
  { pincode: '400026', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Andheri East' },
  { pincode: '400027', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Jogeshwari West' },
  { pincode: '400028', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Jogeshwari East' },
  { pincode: '400029', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Goregaon West' },
  { pincode: '400030', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Goregaon East' },
  { pincode: '400031', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Malad West' },
  { pincode: '400032', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Malad East' },
  { pincode: '400033', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Kandivali West' },
  { pincode: '400034', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Kandivali East' },
  { pincode: '400035', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Borivali West' },
  { pincode: '400036', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Borivali East' },
  { pincode: '400037', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Dahisar West' },
  { pincode: '400038', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Dahisar East' },
  { pincode: '400039', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Mira Road' },
  { pincode: '400040', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bhayandar West' },
  { pincode: '400041', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bhayandar East' },
  { pincode: '400042', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Naigaon' },
  { pincode: '400043', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vasai West' },
  { pincode: '400044', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vasai East' },
  { pincode: '400045', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Virar West' },
  { pincode: '400046', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Virar East' },
  { pincode: '400047', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Nalasopara West' },
  { pincode: '400048', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Nalasopara East' },
  { pincode: '400049', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Palghar' },
  { pincode: '400050', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bandra West' },
  { pincode: '400051', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bandra East' },
  { pincode: '400052', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Santacruz West' },
  { pincode: '400053', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Santacruz East' },
  { pincode: '400054', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vile Parle West' },
  { pincode: '400055', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vile Parle East' },
  { pincode: '400056', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Andheri West' },
  { pincode: '400057', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Andheri East' },
  { pincode: '400058', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Jogeshwari West' },
  { pincode: '400059', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Jogeshwari East' },
  { pincode: '400060', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Goregaon West' },
  { pincode: '400061', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Goregaon East' },
  { pincode: '400062', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Malad West' },
  { pincode: '400063', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Malad East' },
  { pincode: '400064', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Kandivali West' },
  { pincode: '400065', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Kandivali East' },
  { pincode: '400066', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Borivali West' },
  { pincode: '400067', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Borivali East' },
  { pincode: '400068', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Dahisar West' },
  { pincode: '400069', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Dahisar East' },
  { pincode: '400070', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Mira Road' },
  { pincode: '400071', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bhayandar West' },
  { pincode: '400072', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Bhayandar East' },
  { pincode: '400073', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Naigaon' },
  { pincode: '400074', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vasai West' },
  { pincode: '400075', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Vasai East' },
  { pincode: '400076', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Virar West' },
  { pincode: '400077', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Virar East' },
  { pincode: '400078', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Nalasopara West' },
  { pincode: '400079', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Nalasopara East' },
  { pincode: '400080', district: 'Mumbai City', city: 'Mumbai', state: 'Maharashtra', area: 'Palghar' },
  
  // Delhi
  { pincode: '110001', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Connaught Place' },
  { pincode: '110002', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Parliament Street' },
  { pincode: '110003', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Janpath' },
  { pincode: '110004', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Rajpath' },
  { pincode: '110005', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'India Gate' },
  { pincode: '110006', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Chanakyapuri' },
  { pincode: '110007', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Lodhi Road' },
  { pincode: '110008', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Safdarjung' },
  { pincode: '110009', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Vasant Vihar' },
  { pincode: '110010', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Vasant Kunj' },
  { pincode: '110011', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Dwarka' },
  { pincode: '110012', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Palam' },
  { pincode: '110013', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Najafgarh' },
  { pincode: '110014', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Uttam Nagar' },
  { pincode: '110015', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Janakpuri' },
  { pincode: '110016', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Vikaspuri' },
  { pincode: '110017', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Tilak Nagar' },
  { pincode: '110018', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Rajouri Garden' },
  { pincode: '110019', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Punjabi Bagh' },
  { pincode: '110020', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Shalimar Bagh' },
  { pincode: '110021', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Kingsway Camp' },
  { pincode: '110022', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Mukherjee Nagar' },
  { pincode: '110023', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Model Town' },
  { pincode: '110024', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Guru Teg Bahadur Nagar' },
  { pincode: '110025', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Dilshad Garden' },
  { pincode: '110026', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Seelampur' },
  { pincode: '110027', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Shahdara' },
  { pincode: '110028', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Preet Vihar' },
  { pincode: '110029', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Laxmi Nagar' },
  { pincode: '110030', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Yamuna Vihar' },
  { pincode: '110031', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Geeta Colony' },
  { pincode: '110032', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Mayur Vihar' },
  { pincode: '110033', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Patparganj' },
  { pincode: '110034', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Mandawali' },
  { pincode: '110035', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Krishna Nagar' },
  { pincode: '110036', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Gandhi Nagar' },
  { pincode: '110037', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Shahdara' },
  { pincode: '110038', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Seelampur' },
  { pincode: '110039', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Welcome' },
  { pincode: '110040', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Jaffrabad' },
  { pincode: '110041', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Maujpur' },
  { pincode: '110042', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Gokulpuri' },
  { pincode: '110043', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Karawal Nagar' },
  { pincode: '110044', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Bhajanpura' },
  { pincode: '110045', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Yamuna Vihar' },
  { pincode: '110046', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Geeta Colony' },
  { pincode: '110047', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Mayur Vihar' },
  { pincode: '110048', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Patparganj' },
  { pincode: '110049', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Mandawali' },
  { pincode: '110050', district: 'New Delhi', city: 'Delhi', state: 'Delhi', area: 'Krishna Nagar' },
  
  // Bangalore
  { pincode: '560001', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore GPO' },
  { pincode: '560002', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Fort' },
  { pincode: '560003', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Cantonment' },
  { pincode: '560004', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore City' },
  { pincode: '560005', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Market' },
  { pincode: '560006', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore University' },
  { pincode: '560007', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Palace' },
  { pincode: '560008', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Race Course' },
  { pincode: '560009', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Airport' },
  { pincode: '560010', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Railway Station' },
  { pincode: '560011', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Bus Stand' },
  { pincode: '560012', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Medical College' },
  { pincode: '560013', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Engineering College' },
  { pincode: '560014', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Science College' },
  { pincode: '560015', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Arts College' },
  { pincode: '560016', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Commerce College' },
  { pincode: '560017', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Law College' },
  { pincode: '560018', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Dental College' },
  { pincode: '560019', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Nursing College' },
  { pincode: '560020', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Pharmacy College' },
  { pincode: '560021', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Veterinary College' },
  { pincode: '560022', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Agriculture College' },
  { pincode: '560023', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Forestry College' },
  { pincode: '560024', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Fisheries College' },
  { pincode: '560025', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Horticulture College' },
  { pincode: '560026', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Sericulture College' },
  { pincode: '560027', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Dairy College' },
  { pincode: '560028', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Poultry College' },
  { pincode: '560029', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Sheep College' },
  { pincode: '560030', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Goat College' },
  { pincode: '560031', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Pig College' },
  { pincode: '560032', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Rabbit College' },
  { pincode: '560033', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Fish College' },
  { pincode: '560034', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Prawn College' },
  { pincode: '560035', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Crab College' },
  { pincode: '560036', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Lobster College' },
  { pincode: '560037', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Oyster College' },
  { pincode: '560038', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Mussel College' },
  { pincode: '560039', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Clam College' },
  { pincode: '560040', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Scallop College' },
  { pincode: '560041', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Abalone College' },
  { pincode: '560042', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Sea Urchin College' },
  { pincode: '560043', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Sea Cucumber College' },
  { pincode: '560044', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Jellyfish College' },
  { pincode: '560045', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Starfish College' },
  { pincode: '560046', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Sea Anemone College' },
  { pincode: '560047', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Coral College' },
  { pincode: '560048', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Sponge College' },
  { pincode: '560049', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Algae College' },
  { pincode: '560050', district: 'Bangalore Urban', city: 'Bangalore', state: 'Karnataka', area: 'Bangalore Seaweed College' },
];

async function seedPincodes() {
  try {
    console.log('🌱 Seeding pincode data...');
    
    // Clear existing data
    await prisma.pincodeData.deleteMany({});
    console.log('✅ Cleared existing pincode data');
    
    // Insert new data
    const result = await prisma.pincodeData.createMany({
      data: pincodeData,
      skipDuplicates: true,
    });
    
    console.log(`✅ Successfully seeded ${result.count} pincode records`);
    
    // Verify the data
    const count = await prisma.pincodeData.count();
    console.log(`📊 Total pincodes in database: ${count}`);
    
    // Show sample data
    const sample = await prisma.pincodeData.findFirst();
    if (sample) {
      console.log('📋 Sample pincode record:', sample);
    }
    
  } catch (error) {
    console.error('❌ Error seeding pincodes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPincodes();
