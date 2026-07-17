const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const sampleShop = await db.collection('shops').findOne({ $or: [{bazaar: {$exists: true}}, {bazarId: {$exists: true}}, {bazaarId: {$exists: true}}] });
  console.log("Sample Shop Bazaar Fields:", JSON.stringify(sampleShop, null, 2));

  const sampleProvider = await db.collection('providers').findOne({ bazaarId: { $exists: true } });
  console.log("Sample Provider with our injected bazaarId:", JSON.stringify(sampleProvider, null, 2));

  process.exit(0);
}

run();
