import bcrypt from 'bcryptjs';

// Hash del owner en mockDataService
const ownerHash = '$2b$10$7eiseK8m9e7zrqDANwLz2uUGymm4zJRDU887phw.Z3S3LWyY/uBMu';
const password = '123456';

console.log('Testing password verification...');
console.log('Password:', password);
console.log('Hash:', ownerHash);

try {
  const result = await bcrypt.compare(password, ownerHash);
  console.log('Password match:', result);
  
  if (!result) {
    console.log('Generating new hash for 123456...');
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash:', newHash);
  }
} catch (err) {
  console.error('Error:', err);
}