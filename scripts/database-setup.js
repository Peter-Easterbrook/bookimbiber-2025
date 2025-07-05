/**
 * Database Setup Script for Bookimbiber App
 *
 * This script helps identify the required database attributes for the Google Books integration.
 * Run this to see what attributes need to be added to your Appwrite collection.
 */

// Required attributes for Google Books integration
const requiredAttributes = [
  // Basic book fields (likely already exist)
  {
    key: 'title',
    type: 'string',
    required: true,
    size: 255,
    description: 'Book title',
  },
  {
    key: 'author',
    type: 'string',
    required: true,
    size: 255,
    description: 'Book author(s)',
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    size: 1000,
    description: 'Book description',
  },
  {
    key: 'userId',
    type: 'string',
    required: true,
    size: 36,
    description: 'User ID who owns the book',
  },
  {
    key: 'read',
    type: 'boolean',
    required: false,
    default: false,
    description: 'Whether the book has been read',
  },

  // Google Books metadata fields (likely missing)
  {
    key: 'googleBooksId',
    type: 'string',
    required: false,
    size: 50,
    description: 'Google Books API ID',
  },
  {
    key: 'isbn10',
    type: 'string',
    required: false,
    size: 10,
    description: 'ISBN-10 identifier',
  },
  {
    key: 'isbn13',
    type: 'string',
    required: false,
    size: 13,
    description: 'ISBN-13 identifier',
  },
  {
    key: 'publishedDate',
    type: 'string',
    required: false,
    size: 20,
    description: 'Publication date (YYYY-MM-DD format)',
  },
  {
    key: 'publisher',
    type: 'string',
    required: false,
    size: 255,
    description: 'Book publisher',
  },
  {
    key: 'pageCount',
    type: 'integer',
    required: false,
    min: 0,
    max: 50000,
    description: 'Number of pages',
  },
  {
    key: 'categories',
    type: 'string',
    required: false,
    size: 500,
    description: 'Book categories (comma-separated)',
  },
  {
    key: 'thumbnail',
    type: 'url',
    required: false,
    description: 'Small cover image URL',
  },
  {
    key: 'coverImage',
    type: 'url',
    required: false,
    description: 'Large cover image URL',
  },
  {
    key: 'averageRating',
    type: 'double',
    required: false,
    min: 0,
    max: 5,
    description: 'Average rating (0-5)',
  },
  {
    key: 'ratingsCount',
    type: 'integer',
    required: false,
    min: 0,
    description: 'Number of ratings',
  },
  {
    key: 'language',
    type: 'string',
    required: false,
    size: 10,
    description: 'Book language code',
  },
  {
    key: 'subtitle',
    type: 'string',
    required: false,
    size: 255,
    description: 'Book subtitle',
  },
  {
    key: 'previewLink',
    type: 'url',
    required: false,
    description: 'Google Books preview URL',
  },
  {
    key: 'infoLink',
    type: 'url',
    required: false,
    description: 'Google Books info URL',
  },
  {
    key: 'maturityRating',
    type: 'string',
    required: false,
    size: 20,
    description: 'Content maturity rating',
  },
];

// Generate Appwrite Console commands
function generateAppwriteCommands() {
  console.log('=== APPWRITE COLLECTION SETUP ===\n');
  console.log(
    'To add these attributes to your Appwrite collection, run these commands in your terminal:\n'
  );
  console.log(
    'Make sure to replace DATABASE_ID and COLLECTION_ID with your actual values.\n'
  );

  const DATABASE_ID = '681e133100381d53f199';
  const COLLECTION_ID = '681e13450007197b1942';

  requiredAttributes.forEach((attr) => {
    let command = `appwrite databases createStringAttribute \\
  --databaseId ${DATABASE_ID} \\
  --collectionId ${COLLECTION_ID} \\
  --key ${attr.key}`;

    if (attr.type === 'string' || attr.type === 'url') {
      command += ` \\
  --size ${attr.size}`;
    }

    if (attr.required) {
      command += ` \\
  --required true`;
    }

    if (attr.type === 'integer') {
      command = command.replace(
        'createStringAttribute',
        'createIntegerAttribute'
      );
      if (attr.min !== undefined) command += ` --min ${attr.min}`;
      if (attr.max !== undefined) command += ` --max ${attr.max}`;
    }

    if (attr.type === 'double') {
      command = command.replace(
        'createStringAttribute',
        'createFloatAttribute'
      );
      if (attr.min !== undefined) command += ` --min ${attr.min}`;
      if (attr.max !== undefined) command += ` --max ${attr.max}`;
    }

    if (attr.type === 'boolean') {
      command = command.replace(
        'createStringAttribute',
        'createBooleanAttribute'
      );
      command = command.replace(/--size \d+/, '');
      if (attr.default !== undefined) command += ` --default ${attr.default}`;
    }

    if (attr.type === 'url') {
      // URL attributes are string attributes with validation
      command += ` \\
  --array false`;
    }

    console.log(`# ${attr.description}`);
    console.log(command);
    console.log('');
  });
}

// Generate schema documentation
function generateDocumentation() {
  console.log('\n=== DATABASE SCHEMA DOCUMENTATION ===\n');
  console.log('| Attribute | Type | Required | Size/Range | Description |');
  console.log('|-----------|------|----------|------------|-------------|');

  requiredAttributes.forEach((attr) => {
    const sizeRange = attr.size
      ? attr.size
      : attr.min !== undefined && attr.max !== undefined
      ? `${attr.min}-${attr.max}`
      : attr.min !== undefined
      ? `min: ${attr.min}`
      : attr.max !== undefined
      ? `max: ${attr.max}`
      : '-';

    console.log(
      `| ${attr.key} | ${attr.type} | ${
        attr.required ? 'Yes' : 'No'
      } | ${sizeRange} | ${attr.description} |`
    );
  });
}

// Test data structure
function generateTestData() {
  console.log('\n=== SAMPLE BOOK DATA STRUCTURE ===\n');

  const sampleBook = {
    // Basic fields
    title: 'Learning JavaScript Design Patterns',
    author: 'Addy Osmani',
    description:
      'A comprehensive guide to JavaScript design patterns and best practices.',
    userId: 'user123', // This will be set automatically
    read: false,

    // Google Books metadata
    googleBooksId: 'eLzABAAAQBAJ',
    isbn10: '1449331815',
    isbn13: '9781449331818',
    publishedDate: '2012-07-01',
    publisher: "O'Reilly Media",
    pageCount: 254,
    categories: 'Computers, Programming Languages, JavaScript',
    thumbnail:
      'http://books.google.com/books/content?id=eLzABAAAQBAJ&printsec=frontcover&img=1&zoom=1',
    coverImage:
      'http://books.google.com/books/content?id=eLzABAAAQBAJ&printsec=frontcover&img=1&zoom=0',
    averageRating: 4.2,
    ratingsCount: 85,
    language: 'en',
    subtitle: "A JavaScript and jQuery Developer's Guide",
    previewLink:
      'http://books.google.com/books?id=eLzABAAAQBAJ&dq=javascript&hl=&source=gbs_api',
    infoLink:
      'https://play.google.com/store/books/details?id=eLzABAAAQBAJ&source=gbs_api',
    maturityRating: 'NOT_MATURE',
  };

  console.log(JSON.stringify(sampleBook, null, 2));
}

// Main function
function main() {
  console.log('📚 BOOKIMBIBER DATABASE SETUP HELPER\n');
  console.log(
    'This script helps you set up the required database attributes for Google Books integration.\n'
  );

  generateAppwriteCommands();
  generateDocumentation();
  generateTestData();

  console.log('\n=== QUICK SETUP NOTES ===');
  console.log(
    '1. Most likely you already have: title, author, description, userId, read'
  );
  console.log('2. You probably need to add the Google Books metadata fields');
  console.log('3. Test creating a book after adding the attributes');
  console.log(
    '4. The app will fallback to basic fields if advanced fields fail'
  );
  console.log(
    '\n✅ Setup complete! Check your Appwrite console to add missing attributes.'
  );
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  requiredAttributes,
  generateAppwriteCommands,
  generateDocumentation,
  generateTestData,
};
