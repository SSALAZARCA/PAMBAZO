import { MockDataService } from './dist/services/mockDataService.js';
import { comparePassword, generateToken } from './dist/utils/auth.js';

async function testAuth() {
  try {
    console.log('=== Testing Authentication ===');
    
    // Test 1: Get user by email
    console.log('\n1. Testing getUserByEmail...');
    const user = await MockDataService.getUserByEmail('owner@pambazo.com');
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User role:', user.role);
      console.log('User password hash:', user.password);
    }
    
    // Test 2: Compare password
    if (user) {
      console.log('\n2. Testing password comparison...');
      const isPasswordValid = await comparePassword('123456', user.password);
      console.log('Password valid:', isPasswordValid);
    }
    
    // Test 3: Generate token
    if (user) {
      console.log('\n3. Testing token generation...');
      try {
        const token = generateToken(user.id.toString(), user.email, user.role);
        console.log('Token generated:', token ? 'YES' : 'NO');
        console.log('Token length:', token ? token.length : 0);
      } catch (tokenError) {
        console.error('Token generation error:', tokenError.message);
      }
    }
    
    // Test 4: Check environment variables
    console.log('\n4. Testing environment variables...');
    console.log('JWT_SECRET exists:', process.env.JWT_SECRET ? 'YES' : 'NO');
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'NOT SET');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();