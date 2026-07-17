const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Fix providers
  const providersToFix = await db.collection('providers').find({ bazaarId: { $exists: true } }).toArray();
  for (let p of providersToFix) {
    if (p.bazaarId && typeof p.bazaarId === 'string' && p.bazaarId.length === 24) {
      await db.collection('providers').updateOne(
        { _id: p._id },
        { 
          $set: { bazaar: new mongoose.Types.ObjectId(p.bazaarId) },
          $unset: { bazaarId: "" }
        }
      );
    }
  }
  console.log(`Fixed ${providersToFix.length} providers`);

  // Fix shops
  const shopsToFix = await db.collection('shops').find({ bazaarId: { $exists: true } }).toArray();
  for (let s of shopsToFix) {
    if (s.bazaarId && typeof s.bazaarId === 'string' && s.bazaarId.length === 24) {
      await db.collection('shops').updateOne(
        { _id: s._id },
        { 
          $set: { bazaar: new mongoose.Types.ObjectId(s.bazaarId) },
          $unset: { bazaarId: "" }
        }
      );
    }
  }
  console.log(`Fixed ${shopsToFix.length} shops`);

  process.exit(0);
}

run();
