const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const count = await db.collection('providers').countDocuments();
  console.log("Providers count:", count);

  const sample = await db.collection('providers').find({}).limit(2).toArray();
  console.log(JSON.stringify(sample, null, 2));

  // Also verify partnerprofiles in case "providers" are "partnerprofiles"
  const partnerProfileCount = await db.collection('partnerprofiles').countDocuments();
  console.log("Partner Profiles count:", partnerProfileCount);
  
  process.exit(0);
}

run();
