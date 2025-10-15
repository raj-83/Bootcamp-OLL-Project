import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Password: admin123');
  console.log('Hashed Password:', hashedPassword);
  
  // Sample admin data
  const adminData = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    phone: '+1234567890',
    location: 'New York, USA',
    jobTitle: 'System Administrator',
    yearsExperience: 5,
    department: 'IT',
    bio: 'Experienced system administrator with expertise in managing educational platforms and user systems.',
    responsibilities: [
      'User Management',
      'System Configuration',
      'Data Analytics',
      'Platform Maintenance'
    ],
    role: 'Admin'
  };
  
  console.log('\n=== Sample Admin Data for MongoDB ===');
  console.log(JSON.stringify(adminData, null, 2));
  
  console.log('\n=== MongoDB Insert Command ===');
  console.log('db.admins.insertOne(' + JSON.stringify(adminData, null, 2) + ');');
}

generateHash().catch(console.error);
