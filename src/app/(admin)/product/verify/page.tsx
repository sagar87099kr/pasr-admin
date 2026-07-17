import DataList from '@/components/DataList';
import { fetchAdminData } from '@/lib/fetchData';

export default async function Page() {
  const { stats, requests: productsData } = await fetchAdminData('products');
  const { requests: bazaars } = await fetchAdminData('bazaars');
  const bazaarsList = bazaars.map((b: any) => ({ id: b.raw._id.toString(), name: b.title }));
  
  return (
    <DataList 
      tabName="products"
      title="Product Verification"
      description="Verify vendor products."
      stats={stats}
      requests={productsData}
      bazaarsList={bazaarsList}
    />
  );
}
