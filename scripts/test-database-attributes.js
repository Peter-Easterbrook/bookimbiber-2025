// Test script to check if Google Books attributes exist in Appwrite database
import { Client, Databases, ID } from 'node-appwrite';

const DATABASE_ID = '681e133100381d53f199';
const COLLECTION_ID = '681e13450007197b1942';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('your-project-id') // Replace with your actual project ID
  .setKey('your-api-key'); // Replace with your API key

const databases = new Databases(client);

async function testDatabaseAttributes() {
  try {
    console.log('Testing database attributes...');

    // Try to create a test document with Google Books metadata
    const testData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test description',
      userId: 'test-user-id',
      read: false,
      categories: 'Fiction, Mystery',
      thumbnail: 'https://example.com/image.jpg',
      averageRating: 4.5,
      ratingsCount: 100,
    };

    const result = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      testData
    );

    console.log('✅ SUCCESS: All attributes exist!', result);

    // Clean up - delete the test document
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, result.$id);
    console.log('🧹 Test document cleaned up');
  } catch (error) {
    console.log('❌ ERROR: Missing attributes detected');
    console.log('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
    });

    if (error.message.includes('categories')) {
      console.log('🔴 Missing: categories attribute');
    }
    if (error.message.includes('thumbnail')) {
      console.log('🔴 Missing: thumbnail attribute');
    }
    if (error.message.includes('averageRating')) {
      console.log('🔴 Missing: averageRating attribute');
    }
    if (error.message.includes('ratingsCount')) {
      console.log('🔴 Missing: ratingsCount attribute');
    }
  }
}

testDatabaseAttributes();
