const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log("All collections:", collections.map(c => c.name).sort().join(', '));
  
  // Also check if 'payouts' has any documents
  const payoutCount = await db.collection('payouts').countDocuments();
  console.log("Count in 'payouts':", payoutCount);

  // Maybe 'withdrawals', 'settlements', 'transactions'?
  const withdrawalsCount = await db.collection('withdrawals').countDocuments().catch(() => 0);
  console.log("Count in 'withdrawals':", withdrawalsCount);
  
  const settlementsCount = await db.collection('settlements').countDocuments().catch(() => 0);
  console.log("Count in 'settlements':", settlementsCount);
  
  process.exit(0);
}

run();
