// Test script to verify Cloudinary configuration
require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

console.log('Testing Cloudinary configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('\n❌ Missing Cloudinary credentials!');
  console.log('Please add your Cloudinary credentials to the .env file:');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Test Cloudinary connection
cloudinary.api.ping()
  .then(result => {
    console.log('\n✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    console.log('\n🎉 You can now upload images from your device!');
  })
  .catch(error => {
    console.log('\n❌ Cloudinary connection failed:');
    console.log('Error:', error.message);
    console.log('\nPlease check your Cloudinary credentials in the .env file.');
  });
