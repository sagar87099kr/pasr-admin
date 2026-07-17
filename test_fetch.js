require('dotenv').config({ path: '.env.local' });
const { fetchAdminData } = require('./src/lib/fetchData');

async function test() {
    console.log("Fetching orders...");
    const data = await fetchAdminData('orders');
    console.log(`Found ${data.requests.length} requests`);
    console.log(JSON.stringify(data.stats, null, 2));
    process.exit(0);
}

test();
