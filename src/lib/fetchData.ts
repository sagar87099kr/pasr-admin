import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');
  return { db };
}

export async function fetchAdminData(tab: string, filterParam?: string) {
  try {
    const { db } = await connectToDatabase();
    const stats: { pending: number | string, verified: number | string, rejected: number | string } = { pending: 0, verified: 0, rejected: 0 };
    let data: any[] = [];

    switch (tab) {
      case 'orders':
        {
          let filterQuery: any = {};
          if (filterParam === 'today') {
            const todayStr = new Date().toISOString().split('T')[0];
            filterQuery.createdAt = {
              $gte: new Date(`${todayStr}T00:00:00.000Z`),
              $lt: new Date(`${todayStr}T23:59:59.999Z`)
            };
          }

          stats.pending = await db.collection('orders').countDocuments({ ...filterQuery, orderStatus: 'PENDING' });
          stats.verified = await db.collection('orders').countDocuments({ ...filterQuery, orderStatus: 'COMPLETED' });
          stats.rejected = await db.collection('orders').countDocuments({ ...filterQuery, orderStatus: 'CANCELLED' });
          const orders = await db.collection('orders').find(filterQuery).sort({ createdAt: -1 }).limit(500).toArray();
          
          // Fetch shops first so we know their owner IDs
          const shopsData = await db.collection('shops').find({
             _id: { $in: orders.map((o: any) => {
                 try { return new mongoose.Types.ObjectId(o.shopId); }
                 catch { return o.shopId; }
             })}
          }).toArray();
          
          const shopMap = new Map();
          shopsData.forEach((s: any) => shopMap.set(s._id.toString(), s));
          
          // Collect all customer IDs (from orders and from shop owners)
          const allCustomerIds: any[] = [];
          orders.forEach((o: any) => {
             try { allCustomerIds.push(new mongoose.Types.ObjectId(o.customerId)); }
             catch { allCustomerIds.push(o.customerId); }
          });
          shopsData.forEach((s: any) => {
             if (s.owner) {
                try { allCustomerIds.push(new mongoose.Types.ObjectId(s.owner)); }
                catch { allCustomerIds.push(s.owner); }
             }
          });
          
          const customersData = await db.collection('customers').find({
             _id: { $in: allCustomerIds }
          }).toArray();
          
          const customerMap = new Map();
          customersData.forEach((c: any) => customerMap.set(c._id.toString(), {
              name: c.name || c.username || 'Unknown',
              phone: c.username || c.mobileNumber || c.phone || 'N/A'
          }));
          
          data = orders.map((d: any) => {
            const customerData = customerMap.get(d.customerId?.toString()) || { name: 'Unknown Customer', phone: 'N/A' };
            const shopDoc = shopMap.get(d.shopId?.toString());
            const shopName = shopDoc ? shopDoc.shopName : 'Unknown Shop';
            const shopOwnerData = (shopDoc && shopDoc.owner) ? customerMap.get(shopDoc.owner.toString()) : null;
            const shopPhone = shopOwnerData ? shopOwnerData.phone : 'N/A';
            
            return {
              id: d.orderId || d._id.toString().substring(0, 8),
              status: d.orderStatus || 'Pending',
              time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
              title: `Order by ${customerData.name}`,
              customerName: customerData.name,
              customerPhone: customerData.phone,
              shopName: shopName,
              shopPhone: shopPhone,
              raw: d
            };
          });
        }
        break;
      case 'payouts':
        {
          stats.pending = await db.collection('transactionhistories').countDocuments({ type: 'PAYOUT_TO_SHOP', status: 'PENDING' });
          stats.verified = await db.collection('transactionhistories').countDocuments({ type: 'PAYOUT_TO_SHOP', status: 'SUCCESS' });
          stats.rejected = await db.collection('transactionhistories').countDocuments({ type: 'PAYOUT_TO_SHOP', status: 'FAILED' });
          const payouts = await db.collection('transactionhistories').find({ type: 'PAYOUT_TO_SHOP' }).sort({ createdAt: -1 }).limit(500).toArray();
          
          // Fetch shop names
          const shopsData = await db.collection('shops').find({
             _id: { $in: payouts.map((p: any) => {
                 try { return new mongoose.Types.ObjectId(p.shopId); }
                 catch { return p.shopId; }
             })}
          }).toArray();
          
          const shopMap = new Map();
          shopsData.forEach((s: any) => shopMap.set(s._id.toString(), s.shopName || 'Unknown Shop'));
          
          data = payouts.map(d => ({
            id: d._id.toString().substring(0, 8),
            status: d.status || 'Pending',
            time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
            title: `Payout for ${shopMap.get(d.shopId?.toString()) || 'Unknown Shop'}`,
            amount: d.amount,
            raw: d
          }));
        }
        break;
      case 'delivery':
        {
          stats.pending = await db.collection('deliveryPartners').countDocuments({ verified: false });
          stats.verified = await db.collection('deliveryPartners').countDocuments({ verified: true });
          stats.rejected = 0;
          data = await db.collection('deliveryPartners').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          data = data.map(d => {
            let img = null;
            if (Array.isArray(d.profilePhoto) && d.profilePhoto.length > 0) img = d.profilePhoto[0].url || d.profilePhoto[0].path;
            else if (d.profilePhoto && typeof d.profilePhoto === 'string') img = d.profilePhoto;
            
            return {
              id: d._id.toString().substring(0, 8),
              status: d.verified ? 'Verified' : 'Pending',
              time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
              title: d.name || 'Unknown Partner',
              imageUrl: img,
              raw: d
            };
          });
        }
        break;
      case 'shops':
        {
          stats.pending = await db.collection('shops').countDocuments({ verified: false });
          stats.verified = await db.collection('shops').countDocuments({ verified: true });
          stats.rejected = 0;
          data = await db.collection('shops').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          data = data.map(d => {
            let img = null;
            if (Array.isArray(d.shopImage) && d.shopImage.length > 0) img = d.shopImage[0].url || d.shopImage[0].path;
            else if (d.shopImage && typeof d.shopImage === 'string') img = d.shopImage;
            
            return {
              id: d._id.toString().substring(0, 8),
              status: d.verified ? 'Verified' : 'Pending',
              time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
              title: d.shopName || 'Unknown Shop',
              imageUrl: img,
              raw: d
            };
          });
        }
        break;
      case 'providers':
        {
          stats.pending = await db.collection('providers').countDocuments({ verified: false });
          stats.verified = await db.collection('providers').countDocuments({ verified: true });
          stats.rejected = 0;
          data = await db.collection('providers').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          data = data.map(d => {
            let img = null;
            if (Array.isArray(d.personImage) && d.personImage.length > 0) img = d.personImage[0].url || d.personImage[0].path;
            else if (d.personImage && typeof d.personImage === 'string') img = d.personImage;
            
            return {
              id: d._id.toString().substring(0, 8),
              status: d.verified ? 'Verified' : 'Pending',
              time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
              title: d.company || d.providerName || d.name || 'Unknown Provider',
              imageUrl: img,
              raw: d
            };
          });
        }
        break;
      case 'bazaars':
        {
          stats.pending = await db.collection('bazaars').countDocuments({ isActive: false });
          stats.verified = await db.collection('bazaars').countDocuments({ isActive: true });
          stats.rejected = 0;
          data = await db.collection('bazaars').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          data = data.map(d => ({
            id: d._id.toString().substring(0, 8),
            status: d.isActive ? 'Active' : 'Inactive',
            time: 'N/A',
            title: d.name || 'Unknown Bazaar',
            raw: d
          }));
        }
        break;
      case 'products':
        {
          stats.pending = await db.collection('products').countDocuments({ isVerified: false });
          stats.verified = await db.collection('products').countDocuments({ isVerified: true });
          stats.rejected = 0;
          const products = await db.collection('products').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          
          const bazaarIds = products.map((p: any) => {
             if (!p.bazaar) return null;
             try { return new mongoose.Types.ObjectId(p.bazaar); }
             catch { return p.bazaar; }
          }).filter(Boolean);
          
          const bazaarsData = await db.collection('bazaars').find({
             _id: { $in: bazaarIds }
          }).toArray();
          
          const bazaarMap = new Map();
          bazaarsData.forEach((b: any) => bazaarMap.set(b._id.toString(), b.name || 'Unknown'));

          data = products.map((d: any) => {
            let img = null;
            if (Array.isArray(d.productImage) && d.productImage.length > 0) img = d.productImage[0].url || d.productImage[0].path;
            else if (d.productImage && typeof d.productImage === 'string') img = d.productImage;
            
            const bazaarName = d.bazaar ? (bazaarMap.get(d.bazaar.toString()) || 'Unknown') : 'Not Assigned';
            
            return {
              id: d._id.toString().substring(0, 8),
              status: d.isVerified ? 'Verified' : 'Pending',
              time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
              title: d.productName || d.name || 'Unknown Product',
              bazaarName,
              imageUrl: img,
              raw: { ...d, bazaarName, bazaarId: d.bazaar ? d.bazaar.toString() : null }
            };
          });
        }
        break;
      case 'items':
        {
          stats.pending = await db.collection('items').countDocuments({ isVerified: false });
          stats.verified = await db.collection('items').countDocuments({ isVerified: true });
          stats.rejected = 0;
          const items = await db.collection('items').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          
          const shopIds = items.map((i: any) => {
             if (!i.shop) return null;
             try { return new mongoose.Types.ObjectId(i.shop); }
             catch { return i.shop; }
          }).filter(Boolean);
          
          const shopsData = await db.collection('shops').find({
             _id: { $in: shopIds }
          }).toArray();
          
          const shopMap = new Map();
          shopsData.forEach((s: any) => shopMap.set(s._id.toString(), { name: s.shopName || 'Unknown', bazaarId: s.bazaar ? s.bazaar.toString() : null }));

          data = items.map((d: any) => {
            let img = null;
            if (d.img && d.img.url) img = d.img.url;
            
            const shopDoc = d.shop ? shopMap.get(d.shop.toString()) : null;
            const shopName = shopDoc ? shopDoc.name : 'Not Assigned';
            const bazaarId = shopDoc ? shopDoc.bazaarId : null;
            
            return {
              id: d._id.toString().substring(0, 8),
              status: d.isVerified ? 'Verified' : 'Pending',
              time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
              title: d.name || 'Unknown Item',
              shopName,
              imageUrl: img,
              raw: { ...d, shopName, bazaarId }
            };
          });
        }
        break;
      case 'kisan-sabha':
        {
          stats.pending = await db.collection('kisanSabhas').countDocuments({ status: 'Pending' });
          stats.verified = await db.collection('kisanSabhas').countDocuments({ status: 'Published' });
          stats.rejected = 0;
          data = await db.collection('kisanSabhas').find({}).sort({ createdAt: -1 }).limit(500).toArray();
          data = data.map(d => ({
            id: d._id.toString().substring(0, 8),
            status: d.status || 'Pending',
            time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
            title: d.title || 'Untitled Post',
            raw: d
          }));
        }
        break;
      case 'dashboard':
        {
          // Aggregate Orders by Day
          const salesByDay = await db.collection('orders').aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ]).toArray();

          // Aggregate Payouts by Day
          const payoutsByDay = await db.collection('transactionhistories').aggregate([
            { $match: { type: 'PAYOUT_TO_SHOP' } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalPayouts: { $sum: "$amount" },
                payoutCount: { $sum: 1 }
              }
            }
          ]).toArray();

          // Merge by Date
          const dailyMap = new Map();
          salesByDay.forEach(s => {
            if (s._id) {
              dailyMap.set(s._id, { date: s._id, sales: s.totalSales || 0, orders: s.orderCount, payouts: 0, payoutCount: 0 });
            }
          });
          payoutsByDay.forEach(p => {
            if (p._id) {
              if (dailyMap.has(p._id)) {
                const existing = dailyMap.get(p._id);
                existing.payouts = p.totalPayouts || 0;
                existing.payoutCount = p.payoutCount;
              } else {
                dailyMap.set(p._id, { date: p._id, sales: 0, orders: 0, payouts: p.totalPayouts || 0, payoutCount: p.payoutCount });
              }
            }
          });

          const todayStr = new Date().toISOString().split('T')[0];
          const todaySalesData = salesByDay.find((s: any) => s._id === todayStr);
          const todayPayoutsData = payoutsByDay.find((p: any) => p._id === todayStr);

          const todaySales = todaySalesData ? todaySalesData.totalSales : 0;
          const todayPayouts = todayPayoutsData ? todayPayoutsData.totalPayouts : 0;

          const activePartners = await db.collection('deliveryPartners').countDocuments({ isActive: true });

          stats.pending = `₹${(todaySales || 0).toFixed(2)}`;
          stats.verified = `₹${(todayPayouts || 0).toFixed(2)}`;
          stats.rejected = activePartners.toString();

          // Convert to Array and Sort by Date Descending
          const dailyStats = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));

          data = dailyStats.map(day => ({
            id: day.date,
            title: `Daily Summary: ${day.date}`,
            status: `Active`,
            time: day.date,
            imageUrl: null,
            raw: {
              Date: day.date,
              'Total Customer Purchases': `₹${day.sales.toFixed(2)}`,
              'Total Orders Placed': day.orders,
              'Total Shop Payouts Requested/Paid': `₹${day.payouts.toFixed(2)}`,
              'Number of Payouts': day.payoutCount
            }
          }));
        }
        break;
    }

    // Convert ObjectIds to strings so they can be passed from Server to Client component
    const safeData = data.map(item => ({
      ...item,
      raw: JSON.parse(JSON.stringify(item.raw))
    }));

    return { stats, requests: safeData };
  } catch (error: any) {
    return { 
      stats: { pending: 0, verified: 0, rejected: 0 }, 
      requests: [{ id: 'ERROR', title: String(error.message || error), raw: {} }] 
    };
  }
}

export async function fetchActiveBazaars() {
  try {
    const { db } = await connectToDatabase();
    const bazaars = await db.collection('bazaars').find({ isActive: true }).sort({ name: 1 }).toArray();
    return bazaars.map(b => ({
      id: b._id.toString(),
      name: b.name
    }));
  } catch (error) {
    console.error('Error fetching bazaars:', error);
    return [];
  }
}
