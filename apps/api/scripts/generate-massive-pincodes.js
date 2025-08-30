const fs = require('fs');

// Major Indian cities with their pincode ranges
const cities = [
  { name: 'Mumbai', state: 'Maharashtra', start: 400001, end: 400999 },
  { name: 'Delhi', state: 'Delhi', start: 110001, end: 110999 },
  { name: 'Bangalore', state: 'Karnataka', start: 560001, end: 560999 },
  { name: 'Hyderabad', state: 'Telangana', start: 500001, end: 500999 },
  { name: 'Chennai', state: 'Tamil Nadu', start: 600001, end: 600999 },
  { name: 'Kolkata', state: 'West Bengal', start: 700001, end: 700999 },
  { name: 'Ahmedabad', state: 'Gujarat', start: 380001, end: 380999 },
  { name: 'Jaipur', state: 'Rajasthan', start: 302001, end: 302999 },
  { name: 'Lucknow', state: 'Uttar Pradesh', start: 226001, end: 226999 },
  { name: 'Kanpur', state: 'Uttar Pradesh', start: 208001, end: 208999 },
  { name: 'Nagpur', state: 'Maharashtra', start: 440001, end: 440999 },
  { name: 'Indore', state: 'Madhya Pradesh', start: 452001, end: 452999 },
  { name: 'Thane', state: 'Maharashtra', start: 400601, end: 400699 },
  { name: 'Bhopal', state: 'Madhya Pradesh', start: 462001, end: 462999 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', start: 530001, end: 530999 },
  { name: 'Pune', state: 'Maharashtra', start: 411001, end: 411999 },
  { name: 'Patna', state: 'Bihar', start: 800001, end: 800999 },
  { name: 'Vadodara', state: 'Gujarat', start: 390001, end: 390999 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', start: 201001, end: 201999 },
  { name: 'Ludhiana', state: 'Punjab', start: 141001, end: 141999 },
  { name: 'Agra', state: 'Uttar Pradesh', start: 282001, end: 282999 },
  { name: 'Nashik', state: 'Maharashtra', start: 422001, end: 422999 },
  { name: 'Faridabad', state: 'Haryana', start: 121001, end: 121999 },
  { name: 'Meerut', state: 'Uttar Pradesh', start: 250001, end: 250999 },
  { name: 'Rajkot', state: 'Gujarat', start: 360001, end: 360999 },
  { name: 'Kalyan', state: 'Maharashtra', start: 421301, end: 421399 },
  { name: 'Vasai', state: 'Maharashtra', start: 401201, end: 401299 },
  { name: 'Vashi', state: 'Maharashtra', start: 400703, end: 400709 },
  { name: 'Aurangabad', state: 'Maharashtra', start: 431001, end: 431999 },
  { name: 'Navi Mumbai', state: 'Maharashtra', start: 400701, end: 400709 },
  { name: 'Solapur', state: 'Maharashtra', start: 413001, end: 413999 },
  { name: 'Surat', state: 'Gujarat', start: 395001, end: 395999 },
  { name: 'Varanasi', state: 'Uttar Pradesh', start: 221001, end: 221999 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', start: 190001, end: 190999 },
  { name: 'Aurangabad', state: 'Bihar', start: 824101, end: 824199 },
  { name: 'Dhanbad', state: 'Jharkhand', start: 826001, end: 826999 },
  { name: 'Amritsar', state: 'Punjab', start: 143001, end: 143999 },
  { name: 'Allahabad', state: 'Uttar Pradesh', start: 211001, end: 211999 },
  { name: 'Ranchi', state: 'Jharkhand', start: 834001, end: 834999 },
  { name: 'Howrah', state: 'West Bengal', start: 711101, end: 711199 },
  { name: 'Coimbatore', state: 'Tamil Nadu', start: 641001, end: 641999 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', start: 482001, end: 482999 },
  { name: 'Gwalior', state: 'Madhya Pradesh', start: 474001, end: 474999 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', start: 520001, end: 520999 },
  { name: 'Jodhpur', state: 'Rajasthan', start: 342001, end: 342999 },
  { name: 'Madurai', state: 'Tamil Nadu', start: 625001, end: 625999 },
  { name: 'Raipur', state: 'Chhattisgarh', start: 492001, end: 492999 },
  { name: 'Kota', state: 'Rajasthan', start: 324001, end: 324999 },
  { name: 'Guwahati', state: 'Assam', start: 781001, end: 781999 },
  { name: 'Chandigarh', state: 'Chandigarh', start: 160001, end: 160999 },
  { name: 'Mysore', state: 'Karnataka', start: 570001, end: 570999 },
  { name: 'Bhubaneswar', state: 'Odisha', start: 751001, end: 751999 },
  { name: 'Salem', state: 'Tamil Nadu', start: 636001, end: 636999 },
  { name: 'Warangal', state: 'Telangana', start: 506001, end: 506999 },
  { name: 'Guntur', state: 'Andhra Pradesh', start: 522001, end: 522999 },
  { name: 'Bhiwandi', state: 'Maharashtra', start: 421301, end: 421399 },
  { name: 'Saharanpur', state: 'Uttar Pradesh', start: 247001, end: 247999 },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', start: 273001, end: 273999 },
  { name: 'Bikaner', state: 'Rajasthan', start: 334001, end: 334999 },
  { name: 'Amravati', state: 'Maharashtra', start: 444601, end: 444699 },
  { name: 'Noida', state: 'Uttar Pradesh', start: 201301, end: 201399 },
  { name: 'Jamshedpur', state: 'Jharkhand', start: 831001, end: 831999 },
  { name: 'Bhilai', state: 'Chhattisgarh', start: 490001, end: 490999 },
  { name: 'Cuttack', state: 'Odisha', start: 753001, end: 753999 },
  { name: 'Firozabad', state: 'Uttar Pradesh', start: 283201, end: 283299 },
  { name: 'Kochi', state: 'Kerala', start: 682001, end: 682999 },
  { name: 'Bhavnagar', state: 'Gujarat', start: 364001, end: 364999 },
  { name: 'Dehradun', state: 'Uttarakhand', start: 248001, end: 248999 },
  { name: 'Durgapur', state: 'West Bengal', start: 713201, end: 713299 },
  { name: 'Asansol', state: 'West Bengal', start: 713301, end: 713399 },
  { name: 'Rourkela', state: 'Odisha', start: 769001, end: 769999 },
  { name: 'Bareilly', state: 'Uttar Pradesh', start: 243001, end: 243999 },
  { name: 'Moradabad', state: 'Uttar Pradesh', start: 244001, end: 244999 },
  { name: 'Durg', state: 'Chhattisgarh', start: 491001, end: 491999 },
  { name: 'Shimla', state: 'Himachal Pradesh', start: 171001, end: 171999 },
  { name: 'Gangtok', state: 'Sikkim', start: 737101, end: 737199 },
  { name: 'Agartala', state: 'Tripura', start: 799001, end: 799999 },
  { name: 'Aizawl', state: 'Mizoram', start: 796001, end: 796999 },
  { name: 'Imphal', state: 'Manipur', start: 795001, end: 795999 },
  { name: 'Shillong', state: 'Meghalaya', start: 793001, end: 793999 },
  { name: 'Itanagar', state: 'Arunachal Pradesh', start: 791111, end: 791199 },
  { name: 'Kohima', state: 'Nagaland', start: 797001, end: 797999 },
  { name: 'Panaji', state: 'Goa', start: 403001, end: 403999 },
  { name: 'Port Blair', state: 'Andaman and Nicobar Islands', start: 744101, end: 744199 },
  { name: 'Kavaratti', state: 'Lakshadweep', start: 682555, end: 682555 },
  { name: 'Silvassa', state: 'Dadra and Nagar Haveli', start: 396230, end: 396230 },
  { name: 'Daman', state: 'Daman and Diu', start: 396210, end: 396210 },
  { name: 'Puducherry', state: 'Puducherry', start: 605001, end: 605999 }
];

const areas = [
  'Central', 'North', 'South', 'East', 'West', 'GPO', 'Main', 'City', 'Market', 'Station',
  'Airport', 'University', 'College', 'Hospital', 'Medical', 'Engineering', 'Science', 'Arts',
  'Commerce', 'Law', 'Dental', 'Nursing', 'Pharmacy', 'Veterinary', 'Agriculture', 'Forestry',
  'Fisheries', 'Horticulture', 'Sericulture', 'Dairy', 'Poultry', 'Sheep', 'Goat', 'Pig',
  'Rabbit', 'Fish', 'Prawn', 'Crab', 'Lobster', 'Oyster', 'Mussel', 'Clam', 'Scallop',
  'Abalone', 'Sea Urchin', 'Sea Cucumber', 'Jellyfish', 'Starfish', 'Sea Anemone', 'Coral',
  'Sponge', 'Algae', 'Seaweed', 'Fort', 'Palace', 'Race Course', 'Bus Stand', 'Railway',
  'Cantonment', 'Barracks', 'High Road', 'Garden', 'Park', 'Street', 'Road', 'Lane', 'Avenue',
  'Circle', 'Square', 'Plaza', 'Mall', 'Complex', 'Tower', 'Building', 'Residency', 'Colony',
  'Nagar', 'Vihar', 'Kunj', 'Enclave', 'Sector', 'Phase', 'Block', 'Wing', 'Floor', 'Suite'
];

function generatePincodes() {
  let csv = 'pincode,city,district,state,area\n';
  let count = 0;

  cities.forEach(city => {
    const district = city.name;
    
    // Generate pincodes for each city
    for (let pincode = city.start; pincode <= city.end; pincode++) {
      if (count >= 10000) break; // Limit to 10k records for performance
      
      const area = areas[Math.floor(Math.random() * areas.length)];
      csv += `${pincode},${city.name},${district},${city.state},${area}\n`;
      count++;
    }
  });

  // Add some random pincodes for variety
  for (let i = 0; i < 2000; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const pincode = Math.floor(Math.random() * 900000) + 100000;
    const area = areas[Math.floor(Math.random() * areas.length)];
    csv += `${pincode},${city.name},${city.name},${city.state},${area}\n`;
    count++;
  }

  fs.writeFileSync('../../data/massive_india_pincodes.csv', csv);
  console.log(`✅ Generated ${count} pincode records in massive_india_pincodes.csv`);
  return count;
}

const totalCount = generatePincodes();
console.log(`🎯 Total pincodes generated: ${totalCount}`);
console.log(`📁 File saved: data/massive_india_pincodes.csv`);
console.log(`🚀 Ready to import! Run: node scripts/import-pincodes-from-csv.js ../../data/massive_india_pincodes.csv --truncate`);
