const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const sample = await db.collection('transactionhistories').find({}).limit(5).toArray();
  console.log(JSON.stringify(sample, null, 2));

  process.exit(0);
}

run();
