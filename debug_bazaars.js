const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const sample = await db.collection('bazaars').find({}).limit(2).toArray();
  console.log(JSON.stringify(sample, null, 2));

  process.exit(0);
}

run();
