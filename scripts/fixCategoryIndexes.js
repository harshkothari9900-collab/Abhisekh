const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collectionName = 'categories';

    const indexes = await db.collection(collectionName).indexes();
    console.log('Existing indexes:', indexes);

    const deleteResult = await db.collection(collectionName).deleteMany({ category_name: { $in: [null, '', undefined] } });
    console.log(`Removed ${deleteResult.deletedCount} categories with null/empty name.`);

    for (const idx of indexes) {
      if (idx.name === 'name_1' || idx.key && (idx.key.name === 1 || idx.key.category_name === 1)) {
        try {
          await db.collection(collectionName).dropIndex(idx.name);
          console.log(`Dropped index: ${idx.name}`);
        } catch (err) {
          console.warn(`Could not drop index ${idx.name}:`, err.message);
        }
      }
    }

    try {
      await db.collection(collectionName).createIndex(
        { category_name: 1 },
        { unique: true, partialFilterExpression: { category_name: { $exists: true } } }
      );
      console.log('Created partial unique index on category_name (exists only)');
    } catch (err) {
      console.error('Failed to create index:', err.message);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
